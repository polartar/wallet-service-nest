import { WalletEntity } from './../wallet/wallet.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RickAccountEntity as AccountEntity } from './account.entity'
import { AccountService } from './account.service'
import { AccountController } from './account.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity, //
      WalletEntity,
    ]),
  ],
  providers: [AccountService],
  exports: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
