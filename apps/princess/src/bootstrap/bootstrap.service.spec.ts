import { Test, TestingModule } from '@nestjs/testing'
import { BootstrapService } from './bootstrap.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { JwtService } from '@nestjs/jwt'

describe('BootstrapService', () => {
  let service: BootstrapService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      providers: [BootstrapService, JwtService],
    }).compile()

    service = module.get<BootstrapService>(BootstrapService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
