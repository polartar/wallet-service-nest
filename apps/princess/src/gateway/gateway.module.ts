import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GateWayGuard } from './gateway.guard'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GateWayGuard,
    },
  ],
})
export class GateWayModule {}
