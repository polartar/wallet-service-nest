import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AssetService } from './asset.service'
import { Environment } from '../environments/environment.dev'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletEntity } from '../wallet/wallet.entity'
import { AccountEntity } from '../account/account.entity'
import { AssetEntity } from '../wallet/asset.entity'
import { TransactionEntity } from '../wallet/transaction.entity'
import { AppModule } from '../app/app.module'
import { PortfolioModule } from '../portfolio/portfolio.module'
import { HttpModule } from '@nestjs/axios'
import { AssetModule } from './asset.module'
import { NftModule } from '../nft/nft.module'
import { NftService } from '../nft/nft.service'

describe('AssetService', () => {
  let service: AssetService

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
        AppModule,
        NftModule,
        PortfolioModule,
        HttpModule,
        AssetModule,
      ],
      providers: [AssetService, NftService],
    }).compile()

    service = module.get<AssetService>(AssetService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
