import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { TotpModule } from '../totp/totp.module'

@Module({
  imports: [
    AuthModule,
    TotpModule,
    ConfigModule.forRoot({ isGlobal: true, load: [Environment] }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
