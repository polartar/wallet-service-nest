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

  // it('should generate transaction', async () => {
  //   const transactionData: ITransactionInput = {
  //     from: 'myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx',
  //     to: 'myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx',
  //     amount: 1,
  //     coinType: ECoinType.BITCOIN,
  //   }

  //   const response = await service.generate(transactionData)
  //   expect(response.success).toBeTruthy()
  // }, 10000)
})
