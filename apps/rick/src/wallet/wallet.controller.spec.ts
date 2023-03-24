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
import { ethers } from 'ethers'
import { EEnvironment } from '../environments/environment.types'
import { SecondsIn } from './wallet.types'
import { firstValueFrom } from 'rxjs'
import { HistoryEntity } from './history.entity'
import { AddressEntity } from './address.entity'
import { EPeriod, EWalletType } from '@rana/core'

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
            AddressEntity,
            HistoryEntity,
          ],
        }),
        TypeOrmModule.forFeature([
          WalletEntity, //
          AccountEntity,
          AddressEntity,
          HistoryEntity,
        ]),
        AppModule,
        PortfolioModule,
        WalletModule,
        AccountModule,
        HttpModule,
      ],
      controllers: [WalletController],
      providers: [WalletService],
    }).compile()

    controller = module.get<WalletController>(WalletController)
    accountService = module.get<AccountService>(AccountService)
    portfolioService = module.get<PortfolioService>(PortfolioService)
    configService = module.get<ConfigService>(ConfigService)
    walletService = module.get<WalletService>(WalletService)
    httpService = module.get<HttpService>(HttpService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should create new account', async () => {
    await accountService.create({ email: 'test@gmail.com', name: 'test' })
    const account = await accountService.lookup({ email: 'test@gmail.com' })
    expect(account.email).toBe('test@gmail.com')
  })

  it('should add new ETH wallet', async () => {
    await controller.createPortfolio(
      '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
      1,
      EWalletType.METAMASK,
      // ECoinType.ETHEREUM,
    )

    const ethWallets = await portfolioService.getEthWallets()
    expect(ethWallets.length).toBe(1)
    expect(ethWallets[0].address).toBe(
      '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
    )
  }, 20000)

  it('should get wallet history for the account for 1 month', async () => {
    const provider = new ethers.providers.EtherscanProvider(
      'goerli',
      configService.get<string>(EEnvironment.etherscanAPIKey),
    )
    const history = await provider.getHistory(
      '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
    )
    const periodAsNumber = '1M' in SecondsIn ? SecondsIn['1M'] : null
    const filteredHistory = history.filter(
      (item) =>
        item.timestamp >=
        walletService.getCurrentTimeBySeconds() - periodAsNumber,
    )
    const walletsHistory = await controller.getHistory(1, EPeriod.Month)
    expect(walletsHistory[0].addresses[0].history.length).toBe(
      filteredHistory.length,
    )
  })

  it('should add new BTC wallet', async () => {
    await accountService.create({ email: 'test1@gmail.com', name: 'test1' })
    await controller.createPortfolio(
      'myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx',
      2,
      EWalletType.VAULT,
      // ECoinType.ETHEREUM,
    )

    const btcWallets = await portfolioService.getBtcWallets()
    expect(btcWallets.length).toBe(1)
    expect(btcWallets[0].address).toBe('myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx')
  })

  it('should get wallet history for the BTC account', async () => {
    const txResponse = await firstValueFrom(
      httpService.get(
        `https://api.blockcypher.com/v1/btc/test3/addrs/myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx`,
      ),
    )

    const walletsHistory = await controller.getHistory(2, EPeriod.All)

    expect(walletsHistory[0].addresses[0].history.length).toBe(
      txResponse.data.txrefs.length,
    )
  }, 20000)

  // it('should inactive the wallets', async () => {
  //   await controller.activeWallets([
  //     {
  //       id: 1,
  //       isActive: false,
  //     },
  //   ])
  //   const ethWallets = await portfolioService.getEthWallets()
  //   expect(ethWallets.length).toBe(0)
  // })

  // it('should active the wallet', async () => {
  //   await controller.activeWallets([
  //     {
  //       id: 1,
  //       isActive: true,
  //     },
  //   ])
  //   const ethWallets = await portfolioService.getEthWallets()
  //   expect(ethWallets.length).toBe(1)
  // })
})
