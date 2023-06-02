import { Test, TestingModule } from '@nestjs/testing'
import { XpubService } from './xpub.service'

describe('XpubService', () => {
  let service: XpubService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XpubService],
    }).compile()

    service = module.get<XpubService>(XpubService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
