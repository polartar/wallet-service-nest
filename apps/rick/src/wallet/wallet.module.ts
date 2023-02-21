import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletEntity } from './wallet.entity'
import { WalletService } from './wallet.service'
import { AccountEntity } from '../account/account.entity'
import { WalletController } from './wallet.controller'
import { PortfolioModule } from '../portfolio/portfolio.module'
import { AccountModule } from '../account/account.module'
import { RecordEntity } from './record.entity'
import { Environment } from '../environments/environment.dev'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    ConfigModule.forRoot({ load: [Environment] }),
    TypeOrmModule.forFeature([
      WalletEntity, //
      AccountEntity,
      RecordEntity,
    ]),
    forwardRef(() => PortfolioModule),
    AccountModule,
    HttpModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
