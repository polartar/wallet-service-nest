import { IsNull, Not, Repository } from 'typeorm'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { WalletEntity } from './wallet.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { SecondsIn } from './wallet.types'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { TransactionEntity } from './transaction.entity'
import { ENetworks, EPeriod } from '@rana/core'
import * as Sentry from '@sentry/node'
import { IVaultCoin } from './dto/add-xpubs'
import { AccountService } from '../account/account.service'
import { AssetService } from '../asset/asset.service'
import { PortfolioService } from '../portfolio/portfolio.service'
import { AssetEntity } from './asset.entity'

@Injectable()
export class WalletService {
  alchemyInstance
  princessAPIUrl: string
  liquidAPIKey: string
  liquidAPIUrl: string

  constructor(
    private configService: ConfigService,
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly accountService: AccountService,
    private readonly assetService: AssetService,
    private readonly portfolioService: PortfolioService,
  ) {
    this.princessAPIUrl = this.configService.get<string>(
      EEnvironment.princessAPIUrl,
    )

    this.liquidAPIKey = this.configService.get<string>(
      EEnvironment.liquidAPIKey,
    )
    this.liquidAPIUrl = this.configService.get<string>(
      EEnvironment.liquidAPIUrl,
    )

    this.assetService.confirmWalletBalances()
    this.startFetchEthereum()
  }

  async startFetchEthereum() {
    await this.portfolioService.updateCurrentWallets()
    this.portfolioService.fetchEthereumTransactions(ENetworks.ETHEREUM)
    this.portfolioService.fetchEthereumTransactions(ENetworks.ETHEREUM_TEST)
  }

  async getUserWalletTransaction(
    accountId: string,
    walletId: string,
    start: number,
    count: number,
  ) {
    return await this.transactionRepository.find({
      where: {
        asset: {
          wallets: {
            id: walletId,
            account: {
              accountId: accountId,
            },
          },
        },
      },
      relations: {
        asset: {
          wallets: {
            account: true,
          },
        },
      },
      order: {
        timestamp: 'DESC',
      },
      take: count,
      skip: start,
      cache: 1000 * 60,
    })
  }

  async getWallet(accountId: string, walletId: string) {
    const wallet = await this.walletRepository.findOne({
      where: {
        id: walletId,
        account: {
          accountId: accountId,
        },
      },
      relations: {
        assets: true,
      },
    })

    return {
      id: wallet.id,
      title: wallet.title,
      mnemonic: wallet.mnemonic,
      assets: wallet.assets.map((asset) => asset.id),
    }
  }

  async getWallets(accountId: string) {
    const wallets = await this.walletRepository.find({
      where: {
        account: {
          accountId: accountId,
        },
        mnemonic: Not(IsNull()),
      },
      relations: { assets: true },
    })

    return wallets.map((wallet) => ({
      id: wallet.id,
      mnemonic: wallet.mnemonic,
      title: wallet.title,
      assets: wallet.assets.map((asset) => asset.id),
    }))
  }

  async updateWallet(
    walletId: string,
    accountId: string,
    title: string,
    mnemonic: string,
  ) {
    const wallet = await this.walletRepository.findOne({
      where: {
        id: walletId,
        account: {
          accountId: accountId,
        },
      },
    })

    if (wallet) {
      if (title !== undefined) {
        wallet.title = title
      } else {
        if (mnemonic) {
          wallet.mnemonic = mnemonic
        } else {
          wallet.mnemonic = null
        }
      }
      return this.walletRepository.save(wallet)
    } else {
      Sentry.captureException(
        `updateWallet(): walletId: ${walletId}, accountId: ${accountId}`,
      )
      throw new BadRequestException('Not found wallet')
    }
  }

  async deleteWallet(walletId: string, accountId: string) {
    let response
    try {
      response = await this.walletRepository.delete({
        id: walletId,
        account: {
          accountId: accountId,
        },
      })
    } catch (err) {
      Sentry.captureException(
        `deleteWallet(): ${err.message} with "${walletId}"`,
      )
      throw new Error(err.message)
    }
    if (response.affected !== 1) {
      throw new NotFoundException('Wallet Not Found')
    }
    return { message: 'SUCCESS' }
  }

  async addNewWallet(
    accountId: string,
    title: string,
    mnemonic: string,
    assetIds: string[],
  ) {
    const account = await this.accountService.lookup({
      accountId,
    })
    if (!account) {
      throw new BadRequestException(`${accountId} not exists`)
    }

    const assets = await this.assetService.getAssetsByIds(assetIds)

    if (assets.length === 0) {
      throw new BadRequestException(
        `assetIds (${assetIds.toString()}) not exist`,
      )
    }

    if (assetIds.length !== assets.length) {
      const notExistAssetIds = assets
        .filter((asset) => !assetIds.includes(asset.id))
        .map((asset) => asset.id)

      throw new BadRequestException(
        `assetIds (${notExistAssetIds.toString()}) not exist`,
      )
    }

    try {
      const prototype = new WalletEntity()
      prototype.account = account
      prototype.title = title
      if (mnemonic) {
        prototype.mnemonic = mnemonic
      }
      prototype.assets = assets

      const wallet = await this.walletRepository.save(prototype)

      return {
        id: wallet.id,
        title,
        mnemonic,
        assets: assetIds,
      }
    } catch (err) {
      Sentry.captureException(`addNewWallet(): ${err.message}`)

      throw new InternalServerErrorException(
        'Something went wrong while saving wallet',
      )
    }
  }

  updateWallets(wallets: WalletEntity[]) {
    return Promise.all(
      wallets.map((wallet) => this.walletRepository.save(wallet)),
    )
  }

  async getUserWalletPortfolio(
    accountId: string,
    walletId: string,
    period: EPeriod,
    networks: string,
  ) {
    const periodAsNumber = period in SecondsIn ? SecondsIn[period] : null
    const timeInPast =
      period === EPeriod.All
        ? 0
        : this.portfolioService.getCurrentTimeBySeconds() - periodAsNumber || 0

    const queryBuilder = this.walletRepository
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.account', 'account')
      .leftJoinAndSelect('wallet.assets', 'assets')
      .leftJoinAndSelect(
        'assets.transactions',
        'assets.transactions',
        'assets.transactions.timestamp >= :start_at',
        {
          start_at: timeInPast,
        },
      )
      // .where('accounts.accountId IN (:...accounts)', { accounts: [accountId] })
      .where('account.id = :accountId', { accountId })
      .where('wallet.id = :walletId', { walletId })
      .orderBy('wallet.id', 'ASC')
      // .orderBy('assets.address', 'ASC')
      .orderBy('assets.transactions.timestamp', 'ASC')

    const wallet = await queryBuilder.getOne()

    if (!wallet) {
      Sentry.captureException(
        `getUserWalletPortfolio(): wallet(${walletId} not found with account(${accountId}))`,
      )
      throw new BadRequestException(`Wallet not found(${walletId})`)
    }

    let assets: AssetEntity[]

    if (networks) {
      const allowedNetworks = networks.split(',')
      assets = wallet.assets.filter((asset) =>
        allowedNetworks.includes(asset.network),
      )
    } else {
      assets = wallet.assets
    }

    let portfolios = []
    await Promise.all(
      assets.map(async (asset) => {
        const portfolio = asset.transactions

        portfolios = portfolios.concat(
          portfolio.map((item) => ({
            balance: item.balance,
            timestamp: +item.timestamp,
            usdPrice: item.usdPrice,
          })),
        )
        return portfolio
      }),
    )

    return portfolios.sort((a, b) => {
      if (a.timestamp > b.timestamp) {
        return 1
      }
      return -1
    })
  }

  async addVaultCoins(title: string, accountId: string, coins: IVaultCoin[]) {
    const account = await this.accountService.lookup({
      accountId: accountId,
    })
    if (!account) {
      throw new BadRequestException(`${accountId} not exists`)
    }

    try {
      const prototype = new WalletEntity()
      prototype.account = account
      prototype.title = title
      prototype.assets = []
      const walletEntity = await this.walletRepository.save(prototype)

      await Promise.all(
        coins.map(async (coin) => {
          try {
            const network =
              coin.BIP44 === 0
                ? ENetworks.BITCOIN
                : coin.BIP44 === 1
                ? ENetworks.BITCOIN_TEST
                : coin.BIP44 === 60
                ? ENetworks.ETHEREUM
                : ENetworks.ETHEREUM_TEST
            return await Promise.all(
              coin.wallets.map(async (wallet) => {
                for (const newAccount of wallet.accounts) {
                  await this.assetService.createAsset(
                    newAccount.address,
                    newAccount.index,
                    network,
                    newAccount.publickey,
                    walletEntity,
                  )
                  if (network === ENetworks.ETHEREUM) {
                    await this.assetService.createAsset(
                      newAccount.address,
                      newAccount.index,
                      ENetworks.ETHEREUM_TEST,
                      newAccount.publickey,
                      walletEntity,
                    )
                  }
                }
                return wallet
              }),
            )
          } catch (err) {
            // continue regardless of error
          }
        }),
      )

      const newWallet = await this.getWallet(accountId, walletEntity.id)
      return newWallet
    } catch (e) {
      Sentry.captureException(e.message + ' while addNewWallet')

      throw new BadRequestException(e.message)
    }
  }

  async combineWallets(existingAccountId: string, anonymousId: string) {
    const existingAccount = await this.accountService.lookup({
      accountId: existingAccountId,
    })
    const wallets = await this.walletRepository.find({
      where: {
        account: { accountId: anonymousId },
      },
      relations: {
        account: true,
      },
    })
    wallets.map((wallet) => {
      wallet.account = existingAccount
    })

    await this.updateWallets(wallets)

    const resultWallets = await this.walletRepository.find({
      where: { account: { accountId: existingAccountId } },
    })

    return resultWallets
  }

  async addAsset(walletId: string, accountId: string, assetId: string) {
    const walletEntity = await this.walletRepository.findOne({
      where: {
        id: walletId,
        account: {
          accountId: accountId,
        },
      },
      relations: {
        assets: true,
      },
    })

    const assetIds = walletEntity.assets.map((asset) => asset.id)
    if (!assetIds.includes(assetId)) {
      const assetEntity = await this.assetService.getAssetById(assetId)
      walletEntity.assets.push(assetEntity)
      await this.walletRepository.save(walletEntity)
    }

    return {
      id: walletEntity.id,
      title: walletEntity.title,
      mnemonic: walletEntity.mnemonic,
      assets: walletEntity.assets.map((asset) => asset.id),
    }
  }

  async deleteWallets(accountId: string) {
    const wallets = await this.getWallets(accountId)

    if (wallets && wallets.length > 0) {
      wallets.forEach(async (wallet) => {
        const assets = wallet.assets
        await Promise.all(
          assets.map(async (assetId) => {
            return await this.assetService.deleteAsset(assetId)
          }),
        )
      })

      await this.walletRepository.delete({ account: { accountId: accountId } })
    }
  }
}
