import { AccountModule } from './../account/account.module'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { Environment } from './../environments/environment.dev'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AccountService } from '../account/account.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountEntity } from '../account/account.entity'

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
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

        TypeOrmModule.forFeature([AccountEntity]),

        ConfigModule.forRoot({ load: [Environment] }),
        AccountModule,
      ],
      controllers: [AuthController],
      // eslint-disable-next-line array-element-newline
      providers: [AuthService, AccountService],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
