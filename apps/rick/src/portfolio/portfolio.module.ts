import { WalletEntity } from './../wallet/wallet.entity'
import { WalletModule } from './../wallet/wallet.module'
import { Module } from '@nestjs/common'
import { PortfolioService } from './portfolio.service'
import { AccountModule } from '../account/account.module'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Environment } from '../environments/environment.dev'
import { AccountEntity } from '../account/account.entity'

@Module({
  imports: [
    AccountModule,
    WalletModule,
    ConfigModule.forRoot({ load: [Environment] }),
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
  ],
  providers: [PortfolioService],
})
export class PortfolioModule {
  constructor(private readonly portfolioService: PortfolioService) {
    portfolioService.runService()
  }
}
