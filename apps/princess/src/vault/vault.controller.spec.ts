import { Test, TestingModule } from '@nestjs/testing'
import { VaultController } from './vault.controller'

describe('VaultController', () => {
  let controller: VaultController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VaultController],
    }).compile()

    controller = module.get<VaultController>(VaultController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
