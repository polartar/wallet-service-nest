import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { AccountModule } from '../account/account.module'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    AccountModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.GANDALF_DB_HOST || 'localhost',
      port: parseInt(process.env.GANDALF_DB_PORT) || 5434,
      username: process.env.GANDALF_DB_USERNAME || 'myusername',
      password: process.env.GANDALF_DB_PASSWORD || 'mypassword',
      database: process.env.GANDALF_DB_NAME || 'gandalf',
      // TODO: Maybe disable in production?
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
