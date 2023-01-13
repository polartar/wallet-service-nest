import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PairingModule } from '../pairing/pairing.module'
import { TotpController } from './totp.controller'
import { TotpService } from './totp.service'

describe('TotpController', () => {
  let controller: TotpController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
        }),
        PairingModule,
      ],
      controllers: [TotpController],
      providers: [TotpService],
    }).compile()

    controller = module.get<TotpController>(TotpController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
