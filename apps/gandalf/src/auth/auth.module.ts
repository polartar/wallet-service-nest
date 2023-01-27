import { Environment } from './../environments/environment.dev'
import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { ConfigModule } from '@nestjs/config'
import { AccountModule } from '../account/account.module'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  // eslint-disable-next-line array-element-newline
  imports: [
    AccountModule,
    ConfigModule.forRoot({ load: [Environment] }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5431,
      username: 'myusername',
      password: 'mypassword',
      database: 'gandalf',

      // TODO: Maybe disable in production?
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [AuthController],
  // eslint-disable-next-line array-element-newline
  providers: [AuthService],
})
export class AuthModule {}
