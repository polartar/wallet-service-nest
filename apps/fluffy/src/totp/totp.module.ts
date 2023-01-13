import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PairingModule } from '../pairing/pairing.module'

import { PairingService } from '../pairing/pairing.service'
import { TotpController } from './totp.controller'
import { TotpService } from './totp.service'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'pairs',

      // TODO: Maybe disable in production?
      autoLoadEntities: true,
      synchronize: true,
    }),
    PairingModule,
  ],
  providers: [TotpService],
  controllers: [TotpController],
})
export class TotpModule {}
