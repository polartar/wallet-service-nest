import { WalletEntity } from './../wallet/wallet.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountEntity } from './account.entity'
import { AccountService } from './account.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity, //
      WalletEntity,
    ]),
  ],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
