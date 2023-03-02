import { Test, TestingModule } from '@nestjs/testing'
import { TransactionService } from './transaction.service'
import { ICoinType, ITransactionInput } from './transaction.types'
import { HttpModule } from '@nestjs/axios'

describe('TransactionService', () => {
  let service: TransactionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [TransactionService],
    }).compile()

    service = module.get<TransactionService>(TransactionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should generate transaction', async () => {
    const transactionData: ITransactionInput = {
      from: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
      to: '0x4c6348bf16FeA56F3DE86553c0653b817bca799A',
      amount: 123,
      coinType: ICoinType.ETHEREUM,
    }

    const response = await service.generate(transactionData)
    console.log({ response })
    expect(service).toBeDefined()
  })
})
