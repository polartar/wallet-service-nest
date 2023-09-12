import { BigNumber, ethers } from 'ethers'
import { HttpService } from '@nestjs/axios'
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { ECoinTypes, ENetworks, EPortfolioType } from '@rana/core'
import { AssetEntity } from 'apps/rick/src/wallet/asset.entity'
import { TransactionEntity } from 'apps/rick/src/wallet/transaction.entity'
import { Repository } from 'typeorm'
import { formatEther, parseEther } from 'ethers/lib/utils'
import * as Sentry from '@sentry/node'
import {
  ETransactionStatuses,
  IBlockchainTransaction,
  ITransaction,
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

  async handleTransaction(data: any) {
    let event
    try {
      event = data.event
    } catch (err) {
      return
    }
    const network =
      event.network === 'ETH_MAINNET'
        ? ENetworks.ETHEREUM
        : ENetworks.ETHEREUM_TEST
    const assets = await this.getAssetsByNetwork(network)
    const currentAddresses = assets.map((asset) => asset.address)

    try {
      const transaction: IBlockchainTransaction = event.activity[0]

      if (currentAddresses.includes(transaction.fromAddress.toLowerCase())) {
        const provider =
          network === ENetworks.ETHEREUM
            ? this.mainnetProvider
            : this.testnetProvider
        const tx = await provider.getTransaction(transaction.hash)
        console.log({ tx })

        const fee = BigNumber.from(tx.gasPrice).mul(BigNumber.from(tx.gasLimit))
        const amount = BigNumber.from(
          parseEther(transaction.value.toString()),
        ).add(fee)
        const updatedAsset = assets.find(
          (asset) =>
            asset.address.toLowerCase() ===
            transaction.fromAddress.toLowerCase(),
        )
        this.updateTransaction(updatedAsset, transaction, amount, fee)
      }

      if (currentAddresses.includes(transaction.toAddress.toLowerCase())) {
        const amount = BigNumber.from(0).sub(
          parseEther(transaction.value.toString()),
        )
        const updatedAsset = assets.find(
          (asset) =>
            asset.address.toLowerCase() === transaction.toAddress.toLowerCase(),
        )
        this.updateTransaction(
          updatedAsset,
          transaction,
          amount,
          BigNumber.from('0'),
        )
      }
      // eslint-disable-next-line no-empty
    } catch (err) {}
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
    const lastTransaction = await this.getLastTransactionFromAssetId(
      updatedAsset.id,
    )
    const price = await this.getCurrentUSDPrice(ECoinTypes.ETHEREUM)

    const balance = lastTransaction
      ? BigNumber.from(lastTransaction.balance).sub(amount)
      : BigNumber.from(transaction.value)
    const weiBalance = formatEther(balance)
    const weiAmount = formatEther(transaction.value)
    const newHistoryData: ITransaction = {
      asset: updatedAsset,
      from: transaction.fromAddress,
      to: transaction.toAddress,
      cryptoAmount: transaction.value.toString(),
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

    // const postUpdatedAddress = {
    //   assetId: updatedAsset.id,
    //   walletIds: updatedAsset.wallets.map((wallet) => wallet.id),
    //   accountId: updatedAsset.wallets.map((wallet) => wallet.account.id),
    //   newHistory: newHistoryData,
    // }

    // firstValueFrom(
    //   this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
    //     type: EPortfolioType.TRANSACTION,
    //     data: [postUpdatedAddress],
    //   }),
    // ).catch(() => {
    //   Sentry.captureException(
    //     'Princess portfolio/updated api error in fetchEthereumTransactions()',
    //   )
    // })
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
}
