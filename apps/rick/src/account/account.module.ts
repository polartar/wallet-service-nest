import { WalletEntity } from './../wallet/wallet.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountEntity } from './account.entity'
import { AccountService } from './account.service'
import { AccountController } from './account.controller'
import { WalletService } from '../wallet/wallet.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity, //
      WalletEntity,
    ]),
  ],
  providers: [AccountService, WalletService],
  exports: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
