import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { TotpModule } from '../totp/totp.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountEntity } from '../account/account.entity'
import { DeviceEntity } from '../totp/device.entity'

@Module({
  imports: [
    AuthModule,
    TotpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.GANDALF_DB_HOST || 'localhost',
      port: parseInt(process.env.GANDALF_DB_PORT) || 5434,
      username: process.env.GANDALF_DB_USERNAME || 'myusername',
      password: process.env.GANDALF_DB_PASSWORD || 'mypassword',
      database: process.env.GANDALF_DB_NAME || 'gandalf',
      // TODO: Maybe disable in production?
      entities: [
        AccountEntity, //
        DeviceEntity,
      ],
      autoLoadEntities: true,
      synchronize: true,
    }),

    ConfigModule.forRoot({ isGlobal: true, load: [Environment] }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
