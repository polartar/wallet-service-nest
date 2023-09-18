import { Network } from 'alchemy-sdk'
import { BigNumber, ethers } from 'ethers'
import { HttpService } from '@nestjs/axios'
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { ECoinTypes, ENetworks } from '@rana/core'
import { AssetEntity } from 'apps/rick/src/wallet/asset.entity'
import { TransactionEntity } from 'apps/rick/src/wallet/transaction.entity'
import { Repository } from 'typeorm'
import {
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from 'ethers/lib/utils'
import * as Sentry from '@sentry/node'
import {
  ETransactionStatuses,
  IBlockchainTransaction,
  ICryptoAPITransaction,
  ITransaction,
  ITransactionWebhookData,
  IWebhookData,
} from './transactions.types'
import { firstValueFrom } from 'rxjs'
import { EEnvironment } from '../environments/environment.types'

@Injectable()
export class TransactionsService {
  mortyApiUrl: string
  mainnetProvider: ethers.providers.JsonRpcProvider
  testnetProvider: ethers.providers.JsonRpcProvider

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

      throw new InternalServerErrorException(err.message)
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

  async handleCryptoApiTransaction(data: ITransactionWebhookData) {
    let transaction: ICryptoAPITransaction
    try {
      transaction = data.data.item
    } catch (err) {
      return
    }
    let network

    if (transaction.blockchain === 'bitcoin') {
      if (transaction.network === 'mainnet') {
        network = ENetworks.BITCOIN
      } else if (transaction.network === 'testnet') {
        network = ENetworks.BITCOIN_TEST
      } else return
    } else if (transaction.blockchain === 'ethereum') {
      if (transaction.network === 'mainnet') {
        network = ENetworks.ETHEREUM
      } else if (transaction.network === 'testnet') {
        network = ENetworks.ETHEREUM_TEST
      } else return
    } else {
      return
    }
    const assets = await this.getAssetsByNetwork(network)
    const currentAddresses = assets.map((asset) => asset.address.toLowerCase())

    try {
      if (currentAddresses.includes(transaction.address.toLowerCase())) {
        const updatedAsset = assets.find(
          (asset) =>
            asset.address.toLowerCase() === transaction.address.toLowerCase(),
        )
        const lastTransaction = await this.getLastTransactionFromAssetId(
          updatedAsset.id,
        )
        const price = await this.getCurrentUSDPrice(ECoinTypes.BITCOIN)
        let amount = parseUnits(transaction.amount, 8)
        if (transaction.direction === 'incoming') {
          amount = BigNumber.from(0).sub(amount)
        }

        const balance = lastTransaction
          ? BigNumber.from(lastTransaction.balance).sub(amount)
          : parseUnits(transaction.amount, 8)

        const weiBalance = formatUnits(balance, 8)
        const weiAmount = transaction.amount
        const newHistoryData: ITransaction = {
          asset: updatedAsset,
          from: transaction.direction === 'incoming' ? '' : transaction.address,
          to: transaction.direction === 'outcoming' ? '' : transaction.address,
          cryptoAmount: parseUnits(transaction.amount.toString(), 8).toString(),
          fiatAmount: (+weiAmount * price).toFixed(2),
          hash: transaction.minedInBlock.hash,
          blockNumber: transaction.minedInBlock.timestamp,
          balance: balance.toString(),
          usdPrice: (+weiBalance * price).toFixed(2),
          timestamp: this.getCurrentTimeBySeconds(),
          fee: '',
          status:
            transaction.direction === 'outcoming'
              ? ETransactionStatuses.SENT
              : ETransactionStatuses.RECEIVED,
        }
        await this.addHistory(newHistoryData)
      }

      // eslint-disable-next-line no-empty
    } catch (err) {}
  }
}
