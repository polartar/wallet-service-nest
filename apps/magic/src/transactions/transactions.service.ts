import { BigNumber, ethers } from 'ethers'
import { HttpService } from '@nestjs/axios'
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { ECoinTypes, ENetworks } from '@rana/core'
import { AssetEntity } from 'apps/rick/src/wallet/asset.entity'
import { TransactionEntity } from 'apps/rick/src/wallet/transaction.entity'
import { Repository } from 'typeorm'
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'
import * as Sentry from '@sentry/node'
import {
  ETransactionStatuses,
  IBlockchainTransaction,
  ITransaction,
  IWebhookData,
} from './transactions.types'
import { firstValueFrom } from 'rxjs'
import { EEnvironment } from '../environments/environment.types'
import BlockchainSocket = require('blockchain.info/Socket')

@Injectable()
export class TransactionsService implements OnModuleInit {
  mortyApiUrl: string
  mainnetProvider: ethers.providers.JsonRpcProvider
  testnetProvider: ethers.providers.JsonRpcProvider
  btcSocket
  activeBtcAssets: AssetEntity[]
  activeTestBtcAssets: AssetEntity[]
  static INITIALIZED = false

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {
    const infura_key = this.configService.get<string>(EEnvironment.infuraAPIKey)
    this.mortyApiUrl = this.configService.get<string>(EEnvironment.mortyAPIUrl)

    this.mainnetProvider = new ethers.providers.InfuraProvider(
      'mainnet',
      infura_key,
    )
    this.testnetProvider = new ethers.providers.InfuraProvider(
      'goerli',
      infura_key,
    )
  }

  async onModuleInit() {
    if (TransactionsService.INITIALIZED === true) return

    this.subscribeBtcTransaction()

    TransactionsService.INITIALIZED = true
  }

  async getAssetsByNetwork(network: ENetworks): Promise<AssetEntity[]> {
    return await this.assetRepository.find({
      where: {
        network,
      },
      order: {
        transactions: {
          timestamp: 'DESC',
        },
      },
      relations: {
        // wallets: {
        //   account: true,
        // },
        transactions: true,
      },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleTransaction(data: IWebhookData) {
    let event
    try {
      event = data.event
    } catch (err) {
      Sentry.captureMessage(`handleTransaction(): wrong event`, {
        extra: {
          body: JSON.stringify(data),
        },
      })

      return
    }
    const network =
      event.network === 'ETH_MAINNET'
        ? ENetworks.ETHEREUM
        : ENetworks.ETHEREUM_TEST
    const assets = await this.getAssetsByNetwork(network)
    const currentAddresses = assets.map((asset) => asset.address.toLowerCase())

    try {
      const transaction: IBlockchainTransaction = event.activity[0]

      if (currentAddresses.includes(transaction.fromAddress.toLowerCase())) {
        const provider =
          network === ENetworks.ETHEREUM
            ? this.mainnetProvider
            : this.testnetProvider
        const tx = await provider.getTransaction(transaction.hash)

        const fee = BigNumber.from(tx.gasPrice).mul(BigNumber.from(tx.gasLimit))
        const amount = BigNumber.from(
          parseEther(transaction.value.toString()),
        ).add(fee)
        const updatedAsset = assets.find(
          (asset) =>
            asset.address.toLowerCase() ===
            transaction.fromAddress.toLowerCase(),
        )
        await this.updateTransaction(updatedAsset, transaction, amount, fee)
      }

      if (currentAddresses.includes(transaction.toAddress.toLowerCase())) {
        const amount = BigNumber.from(0).sub(
          parseEther(transaction.value.toString()),
        )
        const updatedAsset = assets.find(
          (asset) =>
            asset.address.toLowerCase() === transaction.toAddress.toLowerCase(),
        )
        await this.updateTransaction(
          updatedAsset,
          transaction,
          amount,
          BigNumber.from('0'),
        )
      }
    } catch (err) {
      Sentry.captureMessage(`handleTransaction(): ${err.message}`, {
        extra: {
          body: JSON.stringify(data),
        },
      })
    }
  }
  async getLastTransactionFromAssetId(assetId: string) {
    return await this.transactionRepository.findOne({
      where: {
        asset: {
          id: assetId,
        },
      },
      order: {
        timestamp: 'DESC',
        from: 'DESC',
      },
    })
  }

  async getCurrentUSDPrice(coinType: ECoinTypes): Promise<number> {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`${this.mortyApiUrl}/api/market/${coinType}`),
      )
      return res.data.price
    } catch (err) {
      Sentry.captureException(err.message + 'in getCurrentUSDPrice()')
      return 0
    }
  }

  async updateTransaction(
    updatedAsset: AssetEntity,
    transaction: IBlockchainTransaction,
    amount: BigNumber,
    fee: BigNumber,
  ) {
    try {
      const lastTransaction = await this.getLastTransactionFromAssetId(
        updatedAsset.id,
      )
      const price = await this.getCurrentUSDPrice(ECoinTypes.ETHEREUM)

      const balance = lastTransaction
        ? BigNumber.from(lastTransaction.balance).sub(amount)
        : parseEther(transaction.value.toString())

      const weiBalance = formatEther(balance)
      const weiAmount = transaction.value
      const newHistoryData: ITransaction = {
        asset: updatedAsset,
        from: transaction.fromAddress,
        to: transaction.toAddress,
        cryptoAmount: parseEther(transaction.value.toString()).toString(),
        fiatAmount: (+weiAmount * price).toFixed(2),
        hash: transaction.hash,
        blockNumber: BigNumber.from(transaction.blockNum).toNumber(),
        balance: balance.toString(),
        usdPrice: (+weiBalance * price).toFixed(2),
        timestamp: this.getCurrentTimeBySeconds(),
        fee: fee.toString(),
        status:
          updatedAsset.address === transaction.fromAddress
            ? ETransactionStatuses.SENT
            : ETransactionStatuses.RECEIVED,
      }
      await this.addHistory(newHistoryData)
    } catch (err) {
      Sentry.captureException(`updateTransaction(): ${err.message}`, {
        extra: {
          transaction,
          amount,
          fee,
        },
      })
    }
  }

  async addHistory(data: ITransaction): Promise<TransactionEntity> {
    try {
      return await this.transactionRepository.save(data)
    } catch (err) {
      Sentry.captureException(`addHistory(): ${err.message}`)
    }
  }

  getCurrentTimeBySeconds() {
    return Math.floor(Date.now() / 1000)
  }

  async subscribeBtcTransaction() {
    if (this.btcSocket) {
      this.btcSocket.close()
    }

    this.activeBtcAssets = await this.getAssetsByNetwork(ENetworks.BITCOIN)
    const addresses = this.activeBtcAssets.map((asset) => asset.address)

    if (addresses.length > 0) {
      this.btcSocket = new BlockchainSocket()

      this.btcSocket.onTransaction((transaction) => {
        this.onBTCTransaction(transaction)
      })

      this.btcSocket.on('error', (err) => {
        Sentry.captureException(`subscribeBtcTransaction(): ${err.message}`)
      })
    }
  }

  shareElement(arr1: string[], arr2: string[]) {
    return arr1.filter((x) => arr2.includes(x)).length > 0
  }

  async onBTCTransaction(transaction) {
    const senderAddresses = transaction.inputs.map(
      (input) => input.prev_out.addr,
    )
    const receiverAddresses = transaction.out.map((out) => out.addr)
    // const postUpdatedAddresses = []
    // const updatedAddresses = []

    const currentAddresses = this.activeBtcAssets.map((asset) => asset.address)

    if (
      !this.shareElement(senderAddresses, currentAddresses) &&
      !this.shareElement(receiverAddresses, currentAddresses)
    ) {
      return
    }
    const price = await this.getCurrentUSDPrice(ECoinTypes.BITCOIN)
    try {
      await Promise.all(
        this.activeBtcAssets.map(async (asset) => {
          // const transactions = asset.transactions || []
          const lastTransaction = await this.getLastTransactionFromAssetId(
            asset.id,
          )
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
            await this.addHistory({
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
            await this.addHistory(historyData)
          }

          // Todo: real time update using websocket

          // if (
          //   senderAddresses.includes(asset.address) ||
          //   receiverAddresses.includes(asset.address)
          // ) {
          //   updatedAddresses.push(asset)
          //   postUpdatedAddresses.push({
          //     assetId: asset.id,
          //     walletIds: asset.wallets?.map((wallet) => wallet.id),
          //     accountIds: asset.wallets?.map((wallet) => wallet.account.id),
          //     newHistory: newHistoryData[0],
          //   })
          //   if (newHistoryData.length === 2) {
          //     postUpdatedAddresses.push({
          //       assetId: asset.id,
          //       walletIds: asset.wallets?.map((wallet) => wallet.id),
          //       accountIds: asset.wallets?.map((wallet) => wallet.account.id),
          //       newHistory: newHistoryData[1],
          //     })
          //   }
          // }
          return asset
        }),
      )

      // if (updatedAddresses.length > 0) {
      //   firstValueFrom(
      //     this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
      //       type: EPortfolioType.TRANSACTION,
      //       data: postUpdatedAddresses,
      //     }),
      //   ).catch((err) => {
      //     Sentry.captureException(`Princess portfolio/updated: ${err.message}`)
      //   })

      //   return this.assetService.updateAssets(updatedAddresses)
      // }
    } catch (err) {
      Sentry.captureException(`onBTCTransaction(): ${err.message}`)
    }
  }
}
