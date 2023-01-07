import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AnonGateway } from '../src/gateways/anon.gateway'
import { io, Socket } from 'socket.io-client'
import { EMessage } from '../src/oop'

describe('AnonGateway', () => {
  let app: INestApplication
  let socket: Socket

  beforeAll(async () => {
    // Initialize and start the server
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AnonGateway, //
      ],
    }).compile()

    app = module.createNestApplication()
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
      expect.assertions(2)
      const data = await new Promise((resolve) => {
        socket.on('message', (data) => {
          resolve(JSON.parse(data))
        })
        socket.emit('anonymous', 'bla')
      })
      expect(data).toBeDefined()
      expect(data).toMatchObject({
        type: 'error',
      })
    })

    it('Always sends ACK', async () => {
      expect.assertions(2)
      const data = await new Promise((resolve) => {
        socket.emit(
          'anonymous',
          {
            type: EMessage.Handshake,
          },
          (data) => {
            resolve(data)
          },
        )
      })
      expect(data).toBeDefined()
      expect(data).toMatchObject({
        type: 'ACK',
      })
    })

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
