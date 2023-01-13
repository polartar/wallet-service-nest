import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PairingModule } from '../pairing/pairing.module'
import { TotpService } from './totp.service'

describe('TotpService', () => {
  let service: TotpService

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
      providers: [TotpService],
    }).compile()

    service = module.get<TotpService>(TotpService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
