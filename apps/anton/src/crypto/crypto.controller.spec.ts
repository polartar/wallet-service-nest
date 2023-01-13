import { Test, TestingModule } from '@nestjs/testing'
import { CryptoController } from './crypto.controller'
import { CryptoService } from './crypto.service'

describe('CryptoController', () => {
  let controller: CryptoController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptoController],
      providers: [CryptoService],
    }).compile()

    controller = module.get<CryptoController>(CryptoController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
