import { Test, TestingModule } from '@nestjs/testing'
import { NftService } from './nft.service'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'

describe('NftService', () => {
  let service: NftService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [Environment] }), //
      ],
      providers: [NftService],
    }).compile()

    service = module.get<NftService>(NftService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should get NFT assets', async () => {
    const assets = await service.getNFTAssets({
      address: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
    })
    expect(assets.success).toBeTruthy()
    expect(assets.data.nfts.length).toBe(100)
  }, 20000)
})
