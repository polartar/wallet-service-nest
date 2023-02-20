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
import { HttpModule } from '@nestjs/axios'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'
import { RecordEntity } from './record.entity'
import { PortfolioModule } from '../portfolio/portfolio.module'
import { ethers } from 'ethers'
import { EEnvironment } from '../environments/environment.types'
import { IWalletType, SecondsIn } from './wallet.types'

describe('WalletController', () => {
  let controller: WalletController
  let accountService: AccountService
  let portfolioService: PortfolioService
  let configService: ConfigService
  let walletService: WalletService

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
            RecordEntity,
          ],
        }),
        TypeOrmModule.forFeature([
          WalletEntity, //
          AccountEntity,
          RecordEntity,
        ]),
        WalletModule,
        AccountModule,
        HttpModule,
        PortfolioModule,
      ],
      controllers: [WalletController],
      providers: [WalletService],
    }).compile()

    controller = module.get<WalletController>(WalletController)
    accountService = module.get<AccountService>(AccountService)
    portfolioService = module.get<PortfolioService>(PortfolioService)
    configService = module.get<ConfigService>(ConfigService)
    walletService = module.get<WalletService>(WalletService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should create new account', async () => {
    await accountService.create({ email: 'test@gmail.com', name: 'test' })
    const account = await accountService.lookup({ email: 'test@gmail.com' })
    expect(account.email).toBe('test@gmail.com')
  })

  it('should add new wallet', async () => {
    await controller.createPortfolio(
      '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
      1,
      IWalletType.ETHEREUM,
    )

    const ethWallets = await portfolioService.getEthWallets()
    expect(ethWallets.length).toBe(1)
    expect(ethWallets[0].address).toBe(
      '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
    )
  })

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
    const walletsHistory = await controller.getHistory(1, '1M')

    expect(walletsHistory[0].history.length).toBe(filteredHistory.length)
  })

  it('should inactive the wallets', async () => {
    await controller.activeWallets([
      {
        id: 1,
        isActive: false,
      },
    ])
    const ethWallets = await portfolioService.getEthWallets()
    expect(ethWallets.length).toBe(0)
  })

  it('should active the wallet', async () => {
    await controller.activeWallets([
      {
        id: 1,
        isActive: true,
      },
    ])
    const ethWallets = await portfolioService.getEthWallets()
    expect(ethWallets.length).toBe(1)
  })
})
