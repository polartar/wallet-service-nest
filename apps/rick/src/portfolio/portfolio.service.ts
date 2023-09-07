import { ECoinTypes, EPortfolioType } from '@rana/core'
import { Inject, Injectable, forwardRef } from '@nestjs/common'
import * as Ethers from 'ethers'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
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
import { formatUnits } from 'ethers/lib/utils'
import { ITransaction } from '../asset/asset.types'
import { ETransactionStatuses } from '../wallet/wallet.types'

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
  transferFilter
  transferIface

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => AssetService))
    private readonly assetService: AssetService,
    private readonly httpService: HttpService,
  ) {
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

    this.transferFilter = {
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
    this.transferIface = new ethers.utils.Interface(transferABI)
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

  getCurrentTimeBySeconds() {
    return Math.floor(Date.now() / 1000)
  }

  subscribeEthereumTransactions(assets: AssetEntity[], network: ENetworks) {
    let sourceAddresses: { from?: string; to?: string }[] = assets.map(
      (asset) => ({
        from: asset.address,
      }),
    )

    sourceAddresses = sourceAddresses.concat(
      assets.map((asset) => ({
        to: asset.address,
      })),
    )
    const currentAddresses = assets.map((asset) => asset.address.toLowerCase())

    this.alchemyInstance
      .forNetwork(
        network === ENetworks.ETHEREUM
          ? Network.ETH_MAINNET
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
              const updatedAddress = assets.find(
                (asset) =>
                  asset.address.toLowerCase() ===
                  tx.transaction.from.toLowerCase(),
              )
              this.assetService.updateTransaction(
                updatedAddress,
                tx,
                amount,
                fee,
              )
            }

            if (currentAddresses.includes(tx.transaction.to.toLowerCase())) {
              const amount = BigNumber.from(0).sub(
                BigNumber.from(tx.transaction.value),
              )
              const updatedAddress = assets.find(
                (asset) =>
                  asset.address.toLowerCase() ===
                  tx.transaction.to.toLowerCase(),
              )
              this.assetService.updateTransaction(
                updatedAddress,
                tx,
                amount,
                BigNumber.from('0'),
              )
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
    this.subscribeNFTTransferEvents()

    this.alchemyInstance
      .forNetwork(
        network === ENetworks.ETHEREUM
          ? Network.ETH_MAINNET
          : Network.ETH_GOERLI,
      )
      .ws.on('error', () => {
        Sentry.captureException(
          'fetchEthereumTransactions: Alchemy socket error',
        )
      })
  }

  async onBTCTransaction(transaction) {
    if (!this.activeBtcAssets) {
      return
    }
    const senderAddresses = transaction.inputs.map(
      (input) => input.prev_out.addr,
    )
    const receiverAddresses = transaction.out.map((out) => out.addr)
    const postUpdatedAddresses = []
    const updatedAddresses = []
    const price = await this.assetService.getCurrentUSDPrice(ECoinTypes.BITCOIN)
    try {
      await Promise.all(
        this.activeBtcAssets.map(async (asset) => {
          // const transactions = asset.transactions || []
          const lastTransaction =
            await this.assetService.getLastTransactionFromAssetId(asset.id)
          const newHistoryData: ITransaction[] = []

          if (senderAddresses.includes(asset.address)) {
            // handle if there are two senders with same address
            const inputs = transaction.inputs
            const index = inputs.findIndex(
              (input) => input.prev_out.addr === asset.address,
            )
            const senderInfo = inputs[index]

            inputs.splice(index, 1)

            const currBalance = lastTransaction
              ? Number(lastTransaction.balance)
              : 0
            const balance = currBalance - senderInfo.prev_out.value
            const weiBalance = formatUnits(balance, 8)
            const weiAmount = formatUnits(senderInfo.prev_out.value, 8)
            newHistoryData.push({
              asset,
              from: asset.address,
              to: senderInfo.prev_out.addr,
              hash: transaction.hash,
              cryptoAmount: senderInfo.prev_out.value.toString(),
              fiatAmount: (+weiAmount * price).toFixed(2),
              balance: balance.toString(),
              usdPrice: (+weiBalance * price).toFixed(2),
              status: ETransactionStatuses.SENT,
              timestamp: this.getCurrentTimeBySeconds(),
              fee: '0',
            })
            await this.assetService.addHistory({
              asset,
              ...newHistoryData[0],
            })
          }
          if (receiverAddresses.includes(asset.address)) {
            // handle if sender transfer btc to same address more than twice
            const index = transaction.out.findIndex(
              (out) => out.addr === asset.address,
            )
            const receiverInfo = transaction.out[index]
            transaction.out.splice(index, 1)
            const currBalance = history.length ? Number(history[0].balance) : 0

            const balance = currBalance + receiverInfo.value
            newHistoryData.push({
              asset,
              from: receiverInfo.addr,
              to: asset.address,
              cryptoAmount: receiverInfo.value,
              status: ETransactionStatuses.RECEIVED,
              fiatAmount: (receiverInfo.value * price).toFixed(2),
              hash: transaction.hash,
              fee: '0',
              balance: balance.toString(),
              usdPrice: (balance * price).toFixed(2),
              timestamp: this.getCurrentTimeBySeconds(),
            })

            const historyData =
              newHistoryData.length === 1
                ? newHistoryData[0]
                : newHistoryData[1]
            await this.assetService.addHistory(historyData)
          }

          if (
            senderAddresses.includes(asset.address) ||
            receiverAddresses.includes(asset.address)
          ) {
            updatedAddresses.push(asset)
            postUpdatedAddresses.push({
              assetId: asset.id,
              walletIds: asset.wallets?.map((wallet) => wallet.id),
              accountIds: asset.wallets?.map((wallet) => wallet.account.id),
              newHistory: newHistoryData[0],
            })
            if (newHistoryData.length === 2) {
              postUpdatedAddresses.push({
                assetId: asset.id,
                walletIds: asset.wallets?.map((wallet) => wallet.id),
                accountIds: asset.wallets?.map((wallet) => wallet.account.id),
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
    // listen NFT transfer events on Mainnet
    this.alchemyInstance
      .forNetwork(Network.ETH_MAINNET)
      .ws.on(this.transferFilter, async (log) => {
        this.analyzeLog(log, ENetworks.ETHEREUM)
      })

    // listen NFT transfer events on Goerli
    this.alchemyInstance
      .forNetwork(Network.ETH_GOERLI)
      .ws.on(this.transferFilter, async (log) => {
        this.analyzeLog(log, ENetworks.ETHEREUM_TEST)
      })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analyzeLog(log: any, network: ENetworks) {
    try {
      const currentAddresses: string[] = this.activeTestEthAssets.map(
        (address) => address.address.toLowerCase(),
      )
      const { args } = this.transferIface.parseLog(log)
      const fromAddress = args.from.toLowerCase()
      const toAddress = args.to.toLowerCase()

      if (currentAddresses.includes(fromAddress)) {
        this.notifyNFTUpdate(fromAddress, network)
      }

      if (currentAddresses.includes(toAddress) && fromAddress !== toAddress) {
        this.notifyNFTUpdate(toAddress, network)
      }
    } catch (err) {
      /* continue regardless of error */
    }
  }
}
