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
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [AccountEntity],
        }),

        TypeOrmModule.forFeature([AccountEntity]),

        ConfigModule.forRoot({ load: [Environment] }),
        AccountModule,
      ],
      controllers: [AuthController],
      providers: [
        AuthService, //
        AccountService,
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
