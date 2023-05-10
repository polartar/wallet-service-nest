import { Test, TestingModule } from '@nestjs/testing'
import { VaultService } from './vault.service'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { HttpModule } from '@nestjs/axios'

describe('VaultService', () => {
  let service: VaultService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [Environment] }), //
        HttpModule,
      ],
      providers: [VaultService],
    }).compile()

    service = module.get<VaultService>(VaultService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
