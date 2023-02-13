import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletEntity } from './wallet.entity'
import { WalletService } from './wallet.service'
import { AccountEntity } from '../account/account.entity'
import { WalletController } from './wallet.controller'
import { PortfolioModule } from '../portfolio/portfolio.module'
import { PortfolioService } from '../portfolio/portfolio.service'
import { AccountModule } from '../account/account.module'
import { RecordEntity } from './record.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity, //
      AccountEntity,
      RecordEntity,
    ]),
    forwardRef(() => PortfolioModule),
    AccountModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
