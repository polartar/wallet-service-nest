import { AddressEntity } from './../wallet/address.entity'
import { ICoinType } from './../wallet/wallet.types'
import { Injectable, Logger } from '@nestjs/common'
import * as Ethers from 'ethers'
import { BigNumber } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { WalletService } from '../wallet/wallet.service'
import { HttpService } from '@nestjs/axios'
import BlockchainSocket = require('blockchain.info/Socket')

@Injectable()
export class PortfolioService {
  activeEthAddresses: AddressEntity[]
  activeBtcAddresses: AddressEntity[]
  provider: Ethers.providers.JsonRpcProvider
  princessAPIUrl: string
  btcSocket

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

    const infura_key = this.configService.get<string>(EEnvironment.infuraAPIKey)
    const isProd = this.configService.get<boolean>(EEnvironment.production)
    this.princessAPIUrl = this.configService.get<string>(
      EEnvironment.princessAPIUrl,
    )
    this.provider = new Ethers.providers.InfuraProvider(
      isProd ? 'mainnet' : 'goerli',
      infura_key,
    )

    this.runService()
  }

  async onBTCTransaction(transaction) {
    const senderAddresses = transaction.inputs.map(
      (input) => input.prev_out.addr,
    )
    const receiverAddresses = transaction.out.map((out) => out.addr)
    const updatedRecords = []
    const updatedWallets = []

    try {
      this.activeBtcAddresses = await Promise.all(
        this.activeBtcAddresses.map(async (address) => {
          const history = address.history || []
          if (senderAddresses.includes(address.address)) {
            // handle if there are two senders with same address
            const inputs = transaction.inputs
            const index = inputs.findIndex(
              (input) => input.prev_out.addr === address.address,
            )
            const senderInfo = inputs[index]

            inputs.splice(index, 1)

            const currBalance = history.length
              ? Number(history[history.length - 1].balance)
              : 0
            const record = await this.walletService.addHistory({
              address: address,
              from: '',
              to: senderInfo.prev_out.addr,
              hash: transaction.hash,
              amount: senderInfo.prev_out.value.toString(),
              balance: (currBalance - senderInfo.prev_out.value).toString(),
              timestamp: this.walletService.getCurrentTimeBySeconds(),
            })
            history.push(record)
            updatedRecords.push(record)

            address.history = history
          }
          if (receiverAddresses.includes(address.address)) {
            // handle if sender transfer btc to same address more than twice
            const index = transaction.out.findIndex(
              (out) => out.addr === address.address,
            )
            const receiverInfo = transaction.out[index]
            transaction.out.splice(index, 1)
            const currBalance = history.length
              ? Number(history[history.length - 1].balance)
              : 0

            const record = await this.walletService.addHistory({
              address,
              from: receiverInfo.addr,
              to: '',
              amount: receiverInfo.value,
              hash: transaction.hash,
              balance: (currBalance + receiverInfo.value).toString(),
              timestamp: this.walletService.getCurrentTimeBySeconds(),
            })
            history.push(record)
            updatedRecords.push(record)

            address.history = history
          }

          if (
            senderAddresses.includes(address.address) ||
            receiverAddresses.includes(address.address)
          ) {
            updatedWallets.push(address)
          }
          return address
        }),
      )

      if (updatedRecords.length > 0) {
        this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
          updatedRecords,
        })

        return this.walletService.updateWallets(updatedWallets)
      }
    } catch (err) {
      Logger.error(err.message)
    }
  }

  async initializeWallets() {
    let addresses = await this.walletService.getAllAddresses()
    addresses = addresses.filter((wallet) => wallet.isActive)
    this.activeEthAddresses = addresses.filter(
      (address) => address.wallet.coinType === ICoinType.ETHEREUM,
    )
    this.activeBtcAddresses = addresses.filter(
      (address) => address.wallet.coinType === ICoinType.BITCOIN,
    )
  }

  async getEthWallets(): Promise<AddressEntity[]> {
    return this.activeEthAddresses
  }

  async getBtcWallets(): Promise<AddressEntity[]> {
    return this.activeBtcAddresses
  }

  runService() {
    this.provider.on('block', async (blockNumber) => {
      let block
      try {
        block = await this.provider.getBlock(blockNumber)
      } catch (err) {
        Logger.error(err.message)
      }
      if (block && block.transactions) {
        const promises = block.transactions.map((txHash) =>
          this.provider.getTransaction(txHash),
        )

        const currentAddresses: string[] = this.activeEthAddresses.map(
          (address) => address.address.toLowerCase(),
        )
        Promise.allSettled(promises).then(async (results) => {
          const updatedAddresses = []
          await Promise.all(
            results.map(async (tx) => {
              if (
                tx.status === 'fulfilled' &&
                tx.value.value.toString() !== '0'
              ) {
                let amount = BigNumber.from(0)
                if (
                  tx.value.from &&
                  currentAddresses.includes(tx.value.from.toLowerCase())
                ) {
                  const fee = BigNumber.from(tx.value.gasPrice).mul(
                    BigNumber.from(tx.value.gasLimit),
                  )
                  amount = amount.sub(BigNumber.from(tx.value.value)).sub(fee)
                }
                if (
                  tx.value.to &&
                  currentAddresses.includes(tx.value.to.toLowerCase())
                ) {
                  amount = amount.add(BigNumber.from(tx.value.value))
                }
                if (!amount.isZero()) {
                  const updatedAddress = this.activeEthAddresses.find(
                    (address) => address.address === tx.value.from,
                  )
                  const history = updatedAddress.history
                  const record = await this.walletService.addHistory({
                    address: updatedAddress,
                    from: tx.value.from,
                    to: tx.value.to,
                    amount: tx.value.value.toString(),
                    hash: tx.value.hash,
                    balance: history.length
                      ? BigNumber.from(history[history.length - 1].balance)
                          .add(amount)
                          .toString()
                      : amount.toString(),
                    timestamp: this.walletService.getCurrentTimeBySeconds(),
                  })
                  history.push(record)
                  updatedAddress.history = history
                  updatedAddresses.push(updatedAddress)
                }
              }
            }),
          )

          if (updatedAddresses.length > 0) {
            this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
              updatedAddresses,
            })

            return this.walletService.updateWallets(updatedAddresses)
          }
        })
      }
    })
  }
}
