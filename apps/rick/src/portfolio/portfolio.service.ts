import { EPortfolioType } from '@rana/core'
import { AddressEntity } from './../wallet/address.entity'
import { Injectable } from '@nestjs/common'
import * as Ethers from 'ethers'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { WalletService } from '../wallet/wallet.service'
import { HttpService } from '@nestjs/axios'
import BlockchainSocket = require('blockchain.info/Socket')
import { ECoinType } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import { Alchemy, Network } from 'alchemy-sdk'
import { ethers } from 'ethers'
import * as Sentry from '@sentry/node'

@Injectable()
export class PortfolioService {
  activeEthAddresses: AddressEntity[]
  activeBtcAddresses: AddressEntity[]
  provider: Ethers.providers.JsonRpcProvider
  princessAPIUrl: string
  btcSocket
  alchemyInstance

  constructor(
    private configService: ConfigService,
    private readonly walletService: WalletService,
    private readonly httpService: HttpService,
  ) {
    this.initializeWallets()
    this.btcSocket = new BlockchainSocket()

    this.btcSocket.onTransaction((transaction) => {
      this.onBTCTransaction(transaction)
    })

    const isProd = this.configService.get<boolean>(EEnvironment.isProduction)
    this.princessAPIUrl = this.configService.get<string>(
      EEnvironment.princessAPIUrl,
    )

    const alchemyKey = this.configService.get<string>(
      EEnvironment.alchemyAPIKey,
    )
    this.alchemyConfigure(isProd, alchemyKey)
  }

  alchemyConfigure(isProd: boolean, alchemyKey: string) {
    const settings = {
      apiKey: alchemyKey,
      network: isProd ? Network.ETH_MAINNET : Network.ETH_GOERLI,
    }

    this.alchemyInstance = new Alchemy(settings)

    this.subscribeNFTTransferEvents()
  }

  async onBTCTransaction(transaction) {
    const senderAddresses = transaction.inputs.map(
      (input) => input.prev_out.addr,
    )
    const receiverAddresses = transaction.out.map((out) => out.addr)
    const postUpdatedAddresses = []
    const updatedAddresses = []

    try {
      this.activeBtcAddresses = await Promise.all(
        this.activeBtcAddresses.map(async (address) => {
          const history = address.history || []
          const newHistoryData = []
          if (senderAddresses.includes(address.address)) {
            // handle if there are two senders with same address
            const inputs = transaction.inputs
            const index = inputs.findIndex(
              (input) => input.prev_out.addr === address.address,
            )
            const senderInfo = inputs[index]

            inputs.splice(index, 1)

            const currBalance = history.length ? Number(history[0].balance) : 0
            newHistoryData.push({
              from: '',
              to: senderInfo.prev_out.addr,
              hash: transaction.hash,
              amount: senderInfo.prev_out.value.toString(),
              balance: (currBalance - senderInfo.prev_out.value).toString(),
              timestamp: this.walletService.getCurrentTimeBySeconds(),
            })
            const newHistory = await this.walletService.addHistory({
              address: address,
              ...newHistoryData[0],
            })
            history.push(newHistory)

            address.history = history
          }
          if (receiverAddresses.includes(address.address)) {
            // handle if sender transfer btc to same address more than twice
            const index = transaction.out.findIndex(
              (out) => out.addr === address.address,
            )
            const receiverInfo = transaction.out[index]
            transaction.out.splice(index, 1)
            const currBalance = history.length ? Number(history[0].balance) : 0

            newHistoryData.push({
              from: receiverInfo.addr,
              to: '',
              amount: receiverInfo.value,
              hash: transaction.hash,
              balance: (currBalance + receiverInfo.value).toString(),
              timestamp: this.walletService.getCurrentTimeBySeconds(),
            })

            const historyData =
              newHistoryData.length === 1
                ? newHistoryData[0]
                : newHistoryData[1]
            const newHistory = await this.walletService.addHistory({
              address,
              ...historyData,
            })

            history.push(newHistory)

            address.history = history
          }

          if (
            senderAddresses.includes(address.address) ||
            receiverAddresses.includes(address.address)
          ) {
            updatedAddresses.push(address)
            postUpdatedAddresses.push({
              addressId: address.id,
              walletId: address.wallet.id,
              accountIds: address.wallet.accounts.map(
                (account) => account.accountId,
              ),
              newHistory: newHistoryData[0],
            })
            if (newHistoryData.length === 2) {
              postUpdatedAddresses.push({
                addressId: address.id,
                walletId: address.wallet.id,
                accountIds: address.wallet.accounts.map(
                  (account) => account.accountId,
                ),
                newHistory: newHistoryData[1],
              })
            }
          }
          return address
        }),
      )

      if (updatedAddresses.length > 0) {
        firstValueFrom(
          this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
            type: EPortfolioType.TRANSACTION,
            data: postUpdatedAddresses,
          }),
        ).catch(() => {
          Sentry.captureException(
            'Princess portfolio/updated api error in onBTCTransaction()',
          )
        })

        return this.walletService.updateWallets(updatedAddresses)
      }
    } catch (err) {
      Sentry.captureException(err.message + ' in onBTCTransaction()')
    }
  }

  async initializeWallets() {
    let addresses = await this.walletService.getAllAddresses()
    addresses = addresses.filter((address) => address.wallet.isActive)

    this.activeEthAddresses = addresses.filter(
      (address) => address.wallet.coinType === ECoinType.ETHEREUM,
    )

    this.activeBtcAddresses = addresses.filter(
      (address) => address.wallet.coinType === ECoinType.BITCOIN,
    )
  }

  async getEthWallets(): Promise<AddressEntity[]> {
    return this.activeEthAddresses
  }

  async getBtcWallets(): Promise<AddressEntity[]> {
    return this.activeBtcAddresses
  }

  notifyNFTUpdate(sourceAddress: string) {
    const addressEntity = this.activeEthAddresses.find(
      (address) => address.address.toLowerCase() === sourceAddress,
    )
    firstValueFrom(
      this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
        type: EPortfolioType.NFT,
        data: [
          {
            addressId: addressEntity.id,
            walletId: addressEntity.wallet.id,
            accountIds: addressEntity.wallet.accounts.map(
              (account) => account.accountId,
            ),
          },
        ],
      }),
    ).catch(() => {
      Sentry.captureException(
        'Princess portfolio/updated api error in notifyNFTUpdate()',
      )
    })
  }

  subscribeNFTTransferEvents() {
    const transferFilter = {
      topics: [
        [
          ethers.utils.id('Transfer(address,address,uint256)'), // ERC721 transfer
          ethers.utils.id(
            'TransferSingle(address,address,address,uint256,uint256)', // ERC1155 transfer
          ),
          ethers.utils.id(
            'TransferBatch(address,address,address,uint256[],uint256[])', // ERC1155 batch transfer
          ),
        ],
      ],
    }
    const transferABI = [
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
      'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
      'event TransferBatch(address indexed operator,address indexed from,address indexed to,uint256[] ids,uint256[] values)',
    ]
    const transferIface = new ethers.utils.Interface(transferABI)

    // listen NFT transfer events
    this.alchemyInstance.ws.on(transferFilter, async (log) => {
      try {
        const currentAddresses: string[] = this.activeEthAddresses.map(
          (address) => address.address.toLowerCase(),
        )
        const { args } = transferIface.parseLog(log)
        const fromAddress = args.from.toLowerCase()
        const toAddress = args.to.toLowerCase()

        if (currentAddresses.includes(fromAddress)) {
          this.notifyNFTUpdate(fromAddress)
        }

        if (currentAddresses.includes(toAddress) && fromAddress !== toAddress) {
          this.notifyNFTUpdate(toAddress)
        }
      } catch (err) {
        /* continue regardless of error */
      }
    })
  }
}
