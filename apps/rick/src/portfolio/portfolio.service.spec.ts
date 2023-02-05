import { WalletModule } from './../wallet/wallet.module'
import { AccountModule } from './../account/account.module'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PortfolioService } from './portfolio.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountEntity } from '../account/account.entity'
import { WalletEntity } from '../wallet/wallet.entity'
import { Environment } from './../environments/environment.dev'
import { IWalletType } from '../wallet/wallet.types'

describe('PortfolioService', () => {
  let service: PortfolioService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [Environment] }),

        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            AccountEntity, //
            WalletEntity,
          ],
        }),
        TypeOrmModule.forFeature([
          AccountEntity, //
          WalletEntity,
        ]),
        AccountModule,
        WalletModule,
      ],
      providers: [PortfolioService],
    }).compile()

    service = module.get<PortfolioService>(PortfolioService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // it('should add new wallet', async () => {
  //   await service.addWallet(
  //     1,
  //     '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  //     IWalletType.ETHEREUM,
  //   )

  //   const ethWallets = await service.getEthWallets()
  //   expect(ethWallets.length).toBe(1)
  //   expect(ethWallets[0].address).toBe(
  //     '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  //   )
  // })
})
