import { Test, TestingModule } from '@nestjs/testing'
import { TransactionService } from './transaction.service'
import { ITransactionInput } from './transaction.types'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from './../environments/environment.dev'
import { ECoinType } from '@rana/core'

describe('TransactionService', () => {
  let service: TransactionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      providers: [TransactionService],
    }).compile()

    service = module.get<TransactionService>(TransactionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
