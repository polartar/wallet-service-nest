import { EPortfolioType } from '@rana/core'
import { Inject, Injectable, forwardRef } from '@nestjs/common'
import * as Ethers from 'ethers'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { WalletService } from '../wallet/wallet.service'
import { HttpService } from '@nestjs/axios'
import BlockchainSocket = require('blockchain.info/Socket')
import { ENetworks } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import { AlchemySubscription, Network } from 'alchemy-sdk'
import { ethers, BigNumber } from 'ethers'
import * as Sentry from '@sentry/node'
import { AssetEntity } from '../wallet/asset.entity'
import { AlchemyMultichainClient } from './alchemy-multichain-client'
import { AssetService } from '../asset/asset.service'

@Injectable()
export class PortfolioService {
  activeEthAssets: AssetEntity[]
  activeBtcAssets: AssetEntity[]
  activeTestEthAssets: AssetEntity[]
  activeTestBtcAssets: AssetEntity[]
  provider: Ethers.providers.JsonRpcProvider
  princessAPIUrl: string
  btcSocket
  alchemyInstance

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => AssetService))
    private readonly assetService: AssetService,
    private readonly httpService: HttpService,
  ) {
    // this.updateCurrentWallets()
    this.btcSocket = new BlockchainSocket()

    this.btcSocket.onTransaction((transaction) => {
      this.onBTCTransaction(transaction)
    })

    this.princessAPIUrl = this.configService.get<string>(
      EEnvironment.princessAPIUrl,
    )

    this.alchemyConfigure()
  }

  alchemyConfigure() {
    const mainnetKey = this.configService.get<string>(
      EEnvironment.alchemyMainnetAPIKey,
    )
    const goerliKey = this.configService.get<string>(
      EEnvironment.alchemyGoerliAPIKey,
    )

    const defaultConfig = {
      apiKey: mainnetKey,
      network: Network.ETH_MAINNET,
    }
    const overrides = {
      [Network.ETH_GOERLI]: { apiKey: goerliKey, maxRetries: 10 },
    }

    this.alchemyInstance = new AlchemyMultichainClient(defaultConfig, overrides)

    this.subscribeNFTTransferEvents()
  }

  async updateCurrentWallets() {
    const assets = await this.assetService.getAllAssets()

    this.activeEthAssets = assets.filter(
      (address) => address.network === ENetworks.ETHEREUM,
    )
    this.activeTestEthAssets = assets.filter(
      (address) => address.network === ENetworks.ETHEREUM_TEST,
    )

    this.activeBtcAssets = assets.filter(
      (address) => address.network === ENetworks.BITCOIN,
    )
    this.activeTestBtcAssets = assets.filter(
      (address) => address.network === ENetworks.BITCOIN_TEST,
    )
  }

  // async getEthAssets(): Promise<AssetEntity[]> {
  //   return this.activeEthAssets
  // }
  // async getTestEthAssets(): Promise<AssetEntity[]> {
  //   return this.activeTestEthAssets
  // }

  // async getBtcAssets(): Promise<AssetEntity[]> {
  //   return this.activeBtcAssets
  // }
  // async getTestBtcAssets(): Promise<AssetEntity[]> {
  //   return this.activeTestBtcAssets
  // }

  getCurrentTimeBySeconds() {
    return Math.floor(Date.now() / 1000)
  }

  subscribeEthereumTransactions(addresses: AssetEntity[], network: ENetworks) {
    let sourceAddresses: { from?: string; to?: string }[] = addresses.map(
      (address) => ({
        from: address.address,
      }),
    )

    sourceAddresses = sourceAddresses.concat(
      addresses.map((address) => ({
        to: address.address,
      })),
    )
    const currentAddresses = addresses.map((address) =>
      address.address.toLowerCase(),
    )

    this.alchemyInstance
      .forNetwork(
        network === ENetworks.ETHEREUM
          ? Network.MATIC_MAINNET
          : Network.ETH_GOERLI,
      )
      .ws.on(
        {
          method: AlchemySubscription.MINED_TRANSACTIONS,
          addresses: sourceAddresses,
          includeRemoved: true,
          hashesOnly: false,
        },
        (tx) => {
          try {
            if (currentAddresses.includes(tx.transaction.from.toLowerCase())) {
              const fee = BigNumber.from(tx.transaction.gasPrice).mul(
                BigNumber.from(tx.transaction.gas),
              )
              const amount = BigNumber.from(tx.transaction.value).add(fee)
              const updatedAddress = addresses.find(
                (address) =>
                  address.address.toLowerCase() ===
                  tx.transaction.from.toLowerCase(),
              )
              this.assetService.updateHistory(updatedAddress, tx, amount)
            }

            if (currentAddresses.includes(tx.transaction.to.toLowerCase())) {
              const amount = BigNumber.from(0).sub(
                BigNumber.from(tx.transaction.value),
              )
              const updatedAddress = addresses.find(
                (address) =>
                  address.address.toLowerCase() ===
                  tx.transaction.to.toLowerCase(),
              )
              this.assetService.updateHistory(updatedAddress, tx, amount)
            }
          } catch (err) {
            Sentry.captureException(
              `${err.message} in subscribeEthereumTransactions: (${tx}) `,
            )
          }
        },
      )
  }

  async fetchEthereumTransactions(network: ENetworks) {
    const assets =
      network === ENetworks.ETHEREUM
        ? this.activeEthAssets
        : this.activeTestEthAssets

    this.alchemyInstance
      .forNetwork(
        network === ENetworks.ETHEREUM
          ? Network.ETH_MAINNET
          : Network.ETH_GOERLI,
      )
      .ws.removeAllListeners()

    this.subscribeEthereumTransactions(assets, network)
  }

  // alchemyConfigure(isProd: boolean, alchemyKey: string) {
  //   const settings = {
  //     apiKey: alchemyKey,
  //     network: isProd ? Network.ETH_MAINNET : Network.ETH_GOERLI,
  //   }

  //   this.alchemyInstance = new Alchemy(settings)

  //   this.subscribeNFTTransferEvents()
  // }

  async onBTCTransaction(transaction) {
    const senderAddresses = transaction.inputs.map(
      (input) => input.prev_out.addr,
    )
    const receiverAddresses = transaction.out.map((out) => out.addr)
    const postUpdatedAddresses = []
    const updatedAddresses = []

    try {
      this.activeBtcAssets = await Promise.all(
        this.activeBtcAssets.map(async (asset) => {
          const transactions = asset.transactions || []
          const newHistoryData = []
          if (senderAddresses.includes(asset.address)) {
            // handle if there are two senders with same address
            const inputs = transaction.inputs
            const index = inputs.findIndex(
              (input) => input.prev_out.addr === asset.address,
            )
            const senderInfo = inputs[index]

            inputs.splice(index, 1)

            const currBalance = transactions.length
              ? Number(transactions[0].balance)
              : 0
            newHistoryData.push({
              from: '',
              to: senderInfo.prev_out.addr,
              hash: transaction.hash,
              amount: senderInfo.prev_out.value.toString(),
              balance: (currBalance - senderInfo.prev_out.value).toString(),
              timestamp: this.getCurrentTimeBySeconds(),
            })
            const newHistory = await this.assetService.addHistory({
              asset,
              ...newHistoryData[0],
            })
            transactions.push(newHistory)

            asset.transactions = transactions
          }
          if (receiverAddresses.includes(asset.address)) {
            // handle if sender transfer btc to same address more than twice
            const index = transaction.out.findIndex(
              (out) => out.addr === asset.address,
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
              timestamp: this.getCurrentTimeBySeconds(),
            })

            const historyData =
              newHistoryData.length === 1
                ? newHistoryData[0]
                : newHistoryData[1]
            const newHistory = await this.assetService.addHistory({
              asset,
              ...historyData,
            })

            transactions.push(newHistory)

            asset.transactions = transactions
          }

          if (
            senderAddresses.includes(asset.address) ||
            receiverAddresses.includes(asset.address)
          ) {
            updatedAddresses.push(asset)
            postUpdatedAddresses.push({
              assetId: asset.id,
              walletIds: asset.wallets.map((wallet) => wallet.id),
              accountIds: asset.wallets.map((wallet) => wallet.account.id),
              newHistory: newHistoryData[0],
            })
            if (newHistoryData.length === 2) {
              postUpdatedAddresses.push({
                assetId: asset.id,
                walletIds: asset.wallets.map((wallet) => wallet.id),
                accountIds: asset.wallets.map((wallet) => wallet.account.id),
                newHistory: newHistoryData[1],
              })
            }
          }
          return asset
        }),
      )

      if (updatedAddresses.length > 0) {
        firstValueFrom(
          this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
            type: EPortfolioType.TRANSACTION,
            data: postUpdatedAddresses,
          }),
        ).catch((err) => {
          Sentry.captureException(`Princess portfolio/updated: ${err.message}`)
        })

        return this.assetService.updateAssets(updatedAddresses)
      }
    } catch (err) {
      Sentry.captureException(`onBTCTransaction(): ${err.message}`)
    }
  }

  notifyNFTUpdate(sourceAddress: string, network: ENetworks) {
    const sourceAssets =
      network === ENetworks.ETHEREUM
        ? this.activeEthAssets
        : this.activeTestEthAssets
    const assetEntity = sourceAssets.find(
      (address) => address.address.toLowerCase() === sourceAddress,
    )
    firstValueFrom(
      this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
        type: EPortfolioType.NFT,
        data: [
          {
            addressId: assetEntity.id,
            walletIds: assetEntity.wallets.map((wallet) => wallet.id),
            accountIds: assetEntity.wallets.map((wallet) => wallet.account.id),
          },
        ],
      }),
    ).catch((err) => {
      Sentry.captureException(`notifyNFTUpdate(): ${err.message}`)
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

    // listen NFT transfer events on Mainnet
    this.alchemyInstance
      .forNetwork(Network.ETH_MAINNET)
      .ws.on(transferFilter, async (log) => {
        try {
          const currentAddresses: string[] = this.activeEthAssets.map(
            (address) => address.address.toLowerCase(),
          )
          const { args } = transferIface.parseLog(log)
          const fromAddress = args.from.toLowerCase()
          const toAddress = args.to.toLowerCase()

          if (currentAddresses.includes(fromAddress)) {
            this.notifyNFTUpdate(fromAddress, ENetworks.ETHEREUM)
          }

          if (
            currentAddresses.includes(toAddress) &&
            fromAddress !== toAddress
          ) {
            this.notifyNFTUpdate(toAddress, ENetworks.ETHEREUM)
          }
        } catch (err) {
          /* continue regardless of error */
        }
      })

    // listen NFT transfer events on Goerli
    this.alchemyInstance
      .forNetwork(Network.ETH_GOERLI)
      .ws.on(transferFilter, async (log) => {
        try {
          const currentAddresses: string[] = this.activeTestEthAssets.map(
            (address) => address.address.toLowerCase(),
          )
          const { args } = transferIface.parseLog(log)
          const fromAddress = args.from.toLowerCase()
          const toAddress = args.to.toLowerCase()

          if (currentAddresses.includes(fromAddress)) {
            this.notifyNFTUpdate(fromAddress, ENetworks.ETHEREUM_TEST)
          }

          if (
            currentAddresses.includes(toAddress) &&
            fromAddress !== toAddress
          ) {
            this.notifyNFTUpdate(toAddress, ENetworks.ETHEREUM_TEST)
          }
        } catch (err) {
          /* continue regardless of error */
        }
      })
  }
}
