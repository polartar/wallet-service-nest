import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TotpController } from './totp.controller'
import { TotpService } from './totp.service'
import { DeviceEntity } from './device.entity'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.FLUFFY_DB_HOST || 'localhost',
      port: parseInt(process.env.FLUFFY_DB_PORT) || 5432,
      username: process.env.FLUFFY_DB_USERNAME || 'user',
      password: process.env.FLUFFY_DB_PASSWORD || 'password',
      database: process.env.FLUFFY_DB_NAME || 'pairs',
      // TODO: Maybe disable in production?
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([DeviceEntity]),
  ],
  providers: [TotpService],
  controllers: [TotpController],
})
export class TotpModule {}
