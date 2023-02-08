import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { RickGateway } from '../src/gateways/rick.gateway'
import { io, Socket } from 'socket.io-client'
import { EMessage } from '../src/oop'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

describe('RickGateway', () => {
  let app: INestApplication
  let socket: Socket

  beforeAll(async () => {
    // Initialize and start the server
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RickGateway, //
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

    it('Verify input data', async () => {
      // expect.assertions(2)
      const data = await new Promise((resolve) => {
        socket.on('balance_history', (data) => {
          console.log('balance received', data)
          resolve(JSON.parse(data))
        })
        socket.emit('rick', { accountId: 1 })
      })
      expect(data).toBeDefined()
      expect(data).toMatchObject({
        balance: 123,
      })
    })

    // it('Always sends ACK', async () => {
    //   expect.assertions(2)
    //   const data = await new Promise((resolve) => {
    //     socket.emit(
    //       'anonymous',
    //       {
    //         type: EMessage.Handshake,
    //       },
    //       (data) => {
    //         resolve(data)
    //       },
    //     )
    //   })
    //   expect(data).toBeDefined()
    //   expect(data).toMatchObject({
    //     type: 'ACK',
    //   })
    // })

    // TODO: Handle unknown events. Maybe not possible with socket.io?
    // https://github.com/nestjs/nest/issues/1969#issuecomment-481613583
    //   it('Trying unknown events', async () => {
    //     expect.assertions(2)
    //     const data = await new Promise((resolve) => {
    //       socket.emit('blaaaa', 'basd', (data) => {
    //         resolve(data)
    //       })
    //     })
    //     expect(data).toBeDefined()
    //     expect(data).toMatchObject({
    //       type: 'ACK',
    //     })
    //   })
  })
})
