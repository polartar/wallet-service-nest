import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { EMessage, Message } from '../oop'
import { AnonGateway } from './anon.gateway'
import { io } from 'socket.io-client'

describe('AnonGateway', () => {
  let gateway: AnonGateway

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnonGateway],
    }).compile()

    gateway = module.get<AnonGateway>(AnonGateway)
  })

  it('should be defined', () => {
    expect(gateway).toBeDefined()
  })
})
