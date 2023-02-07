import { WalletModule } from './../wallet/wallet.module'
import { Test, TestingModule } from '@nestjs/testing'
import { PortfolioController } from './portfolio.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletEntity } from '../wallet/wallet.entity'
import { AccountEntity } from '../account/account.entity'
import { WalletService } from '../wallet/wallet.service'
import { PortfolioService } from './portfolio.service'
import { AccountModule } from '../account/account.module'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { AccountService } from '../account/account.service'
import { IWalletType } from '../wallet/wallet.types'

describe('PortfolioController', () => {
  let controller: PortfolioController
  let portfolioService: PortfolioService
  let accountService: AccountService

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
          ],
        }),
        TypeOrmModule.forFeature([
          WalletEntity, //
          AccountEntity,
        ]),
        WalletModule,
        AccountModule,
      ],
      controllers: [PortfolioController],
      providers: [
        WalletService, //
        PortfolioService,
        AccountService,
      ],
    }).compile()

    controller = module.get<PortfolioController>(PortfolioController)
    portfolioService = module.get<PortfolioService>(PortfolioService)
    accountService = module.get<AccountService>(AccountService)
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
    await portfolioService.addNewWallet(
      1,
      '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
      IWalletType.ETHEREUM,
    )

    const ethWallets = await portfolioService.getEthWallets()
    expect(ethWallets.length).toBe(1)
    expect(ethWallets[0].address).toBe(
      '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
    )
  })

  it('should get wallet history for the account', async () => {
    await portfolioService.addNewWallet(
      1,
      '0xedd6f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
      IWalletType.ETHEREUM,
    )
    const walletsHistory = await controller.getHistory(1)
    expect(walletsHistory.length).toBe(2)
  })

  it('should inactive the wallets', async () => {
    await controller.activeWallets([
      {
        id: 1,
        isActive: false,
      },
      {
        id: 2,
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
