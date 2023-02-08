import { WalletEntity } from './../wallet/wallet.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountEntity } from './account.entity'
import { AccountService } from './account.service'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5431,
      username: 'myusername',
      password: 'mypassword',
      database: 'rick',
      entities: [
        AccountEntity, //
        WalletEntity,
      ],
      // TODO: Maybe disable in production?
      autoLoadEntities: true,
      synchronize: true,
    }),

    TypeOrmModule.forFeature([
      AccountEntity, //
      WalletEntity,
    ]),
  ],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
