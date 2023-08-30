import { AppModule } from '../app/app.module'
import { PortfolioService } from '../portfolio/portfolio.service'
import { WalletModule } from './wallet.module'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletEntity } from './wallet.entity'
import { AccountEntity } from '../account/account.entity'
import { AccountModule } from '../account/account.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { AccountService } from '../account/account.service'
import { HttpModule, HttpService } from '@nestjs/axios'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'
import { PortfolioModule } from '../portfolio/portfolio.module'
import { Wallet, ethers } from 'ethers'
import { EEnvironment } from '../environments/environment.types'
import { SecondsIn } from './wallet.types'
import { firstValueFrom } from 'rxjs'
import { TransactionEntity } from './transaction.entity'
import { EPeriod, EWalletType } from '@rana/core'
import { AssetEntity } from './asset.entity'
import { ExPubTypes } from './dto/add-xpubs'
import { AssetModule } from '../asset/asset.module'
import { NftModule } from '../nft/nft.module'

describe('WalletController', () => {
  let controller: WalletController
  let accountService: AccountService
  let portfolioService: PortfolioService
  let configService: ConfigService
  let walletService: WalletService
  let httpService: HttpService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [Environment] }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            WalletEntity, //
            AccountEntity,
            AssetEntity,
            TransactionEntity,
          ],
        }),
        TypeOrmModule.forFeature([
          WalletEntity, //
          AccountEntity,
          AssetEntity,
          TransactionEntity,
        ]),
        HttpModule,
        // AppModule,
        WalletModule,
        AccountModule,
        AssetModule,
        NftModule,
        PortfolioModule,
      ],
      controllers: [WalletController],
      providers: [WalletService],
    }).compile()
    httpService = module.get<HttpService>(HttpService)
    configService = module.get<ConfigService>(ConfigService)
    controller = module.get<WalletController>(WalletController)
    accountService = module.get<AccountService>(AccountService)
    // portfolioService = module.get<PortfolioService>(PortfolioService)
    walletService = module.get<WalletService>(WalletService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should create new account', async () => {
    await accountService.create({
      email: 'test@gmail.com',
      name: 'test',
      accountId: 1,
    })
    const account = await accountService.lookup({ email: 'test@gmail.com' })
    expect(account.email).toBe('test@gmail.com')
  })

  // it('should add a ETH wallet', async () => {
  //   await controller.createPortfolio(
  //     '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  //     1,
  //     EWalletType.METAMASK,
  //   )

  //   const ethWallets = await portfolioService.getEthWallets()
  //   expect(ethWallets.length).toBe(1)
  //   expect(ethWallets[0].address).toBe(
  //     '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  //   )
  //   expect(ethWallets[0].transactions.length).toBeGreaterThan(1)
  // }, 40000)

  // it('should add a fresh ETH wallet', async () => {
  //   const wallet = Wallet.createRandom()
  //   await controller.createPortfolio(wallet.address, 1, EWalletType.METAMASK)

  //   const ethWallets = await portfolioService.getEthWallets()
  //   expect(ethWallets.length).toBe(2)
  //   expect(ethWallets[1].address).toBe(wallet.address)
  //   expect(ethWallets[1].transactions.length).toBe(0)
  // }, 40000)

  // it('should get wallet history for the account for 1 month', async () => {
  //   const provider = new ethers.providers.EtherscanProvider(
  //     'goerli',
  //     configService.get<string>(EEnvironment.etherscanAPIKey),
  //   )
  //   const history = await provider.getHistory(
  //     '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  //   )
  //   const periodAsNumber = '1M' in SecondsIn ? SecondsIn['1M'] : null
  //   const filteredHistory = history.filter(
  //     (item) =>
  //       item.timestamp >=
  //       walletService.getCurrentTimeBySeconds() - periodAsNumber,
  //   )
  //   const walletsHistory = await controller.getHistory(1, EPeriod.Month)
  //   expect(walletsHistory[0].assets[0].transactions.length).toBe(
  //     filteredHistory.length,
  //   )
  // }, 40000)

  // it('should add new BTC wallet', async () => {
  //   await accountService.create({
  //     email: 'test1@gmail.com',
  //     name: 'test1',
  //     accountId: 2,
  //   })
  //   await controller.createPortfolio(
  //     'myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx',
  //     2,
  //     EWalletType.HOTWALLET,
  //   )

  //   const btcWallets = await portfolioService.getBtcWallets()
  //   expect(btcWallets.length).toBe(1)
  //   expect(btcWallets[0].address).toBe('myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx')
  // })

  // it('should get wallet history for the BTC account', async () => {
  //   const txResponse = await firstValueFrom(
  //     httpService.get(
  //       `https://api.blockcypher.com/v1/btc/test3/addrs/myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx`,
  //     ),
  //   )

  //   const walletsHistory = await controller.getHistory(2, EPeriod.All)

  //   expect(walletsHistory[0].assets[0].transactions.length).toBe(
  //     txResponse.data.txrefs.length,
  //   )
  // }, 20000)

  // it('should add Ethereum xpubs', async () => {
  //   const xpub =
  //     'xpub6BzwKCWVs4F9cpmYundX3PjbqcPqERCXKCAw8SRKQgXd1ybTxi338A2Ep6EbGhFp7up4L7PDWivUtnYNC79MWo6wN5SqzrhksQVJupArUxD'
  //   const response = await controller.AddXPubs({
  //     title: 'title',
  //     accountId: 1,
  //     xpubs: [
  //       {
  //         type: ExPubTypes.BIP44,
  //         xpub: xpub,
  //       },
  //     ],
  //   })

  //   expect(response.length).toBe(1)
  //   expect(response[0].title).toBe('title')
  //   expect(response[0].assets.length).toBe(1)
  //   expect(response[0].assets[0].address).toBe(
  //     '0x42cda393bbe6d079501B98cc9cCF1906901b10Bf',
  //   )

  //   expect(response[0].assets[0].transactions.length).toBeGreaterThan(1)
  // }, 20000)

  // it('should add Bitcoin xpubs that has no assets', async () => {
  //   const xpub =
  //     'vpub5YrRyVwDdS4ME6Jyy4qYSgu14JyAzh4B3s9uXfitjdCoFffGeC9iSxCf722LmJ9y5v1SvN4F25Hukw8XYj2vZC1xchB8BsRsXLmm8NNEp5e'
  //   const response = await controller.AddXPubs({
  //     accountId: 1,
  //     xpubs: [
  //       {
  //         BIP44: 714,
  //         xpub: xpub,
  //       },
  //     ],
  //   })
  //   expect(response.length).toBe(1)
  //   expect(response[0].xPub).toBe(xpub)
  //   expect(response[0].assets.length).toBe(0)
  // }, 20000)

  // it('should add a xpub', async () => {
  //   await accountService.create({
  //     email: 'test3@gmail.com',
  //     name: 'test3',
  //     accountId: 3,
  //   })
  //   const xpub =
  //     'xprvA3aS7dVyPgPjHsr4kAjv3Zx5uGdZFqysQDKSso9k34e5KWZauaDZutpxeFXhPKcjGqukZUV8vbhhw8RorRFcU8Zs3EpFyDB2RPxTZUT8DZv'
  //   const response = await controller.createPortfolio(
  //     xpub,
  //     3,
  //     EWalletType.VAULT,
  //   )

  //   expect(response.assets[0].address).toBe(
  //     '0x1771A0FF2ed62529Fb9801e84d134e502358647A',
  //   )

  //   const history = await controller.getHistory(3, EPeriod.Day)
  //   expect(history[0].xPub).toBe(xpub)
  //   expect(history[0].assets[0].address).toBe(
  //     '0x1771A0FF2ed62529Fb9801e84d134e502358647A',
  //   )
  // }, 40000)
})
