import { RickGateway } from './../src/gateways/rick.gateway'
import { PortfolioModule } from '../src/portfolio/portfolio.module'
import { HttpModule } from '@nestjs/axios'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { RickModule } from '../src/gateways/rick.module'
import { io, Socket } from 'socket.io-client'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { PortfolioService } from '../src/portfolio/portfolio.service'

describe('RickGateway', () => {
  let app: INestApplication
  let socket: Socket

  beforeAll(async () => {
    // Initialize and start the server
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RickModule, //
        HttpModule,
        PortfolioModule,
      ],
      providers: [
        RickGateway, //
        PortfolioService,
      ],
    }).compile()

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({
        logger: true,
      }),
    )
    await app.listen(3333)

    // Connect the client
    socket = io('http://localhost:3333/')
  })

  afterAll(async () => {
    socket.disconnect()
  })

  describe('Socket.io Conenction', () => {
    it('Connected', (done) => {
      socket.on('connect', () => {
        done()
      })
    })

    it('Get wallet history', async () => {
      // expect.assertions(2)
      const data = await new Promise((resolve) => {
        socket.on('wallet_history', (data) => {
          console.log('history received', data)
          resolve(JSON.parse(data))
        })
        socket.emit('rick', { accountId: 1 })
      })
      expect(data).toBeDefined()
    })
  })
})
