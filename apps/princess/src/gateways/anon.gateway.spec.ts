import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { EMessage, Message } from '../oop'
import { AnonGateway } from './anon.gateway'
import { io } from 'socket.io-client'

jest.setTimeout(10000)
describe('AnonGateway', () => {
  let app: INestApplication

  beforeAll(async () => {
    // Initialize and start the server
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AnonGateway, //
      ],
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  it('should connect successfully', (done) => {
    const address = app.getHttpServer().listen().address()
    console.log(address)
    const socket = io({
      host: '127.0.0.1',
      port: 3333,
    })

    socket.on('open', () => {
      console.log('I am connected! YEAAAP')
      done()
    })

    socket.on('close', (event) => {
      console.log('Noooo')
      done(event)
    })

    socket.on('error', (error) => {
      console.log('error')
      done(error)
    })
  })
  // it('Should always return an ACK response, with same message ID', () => {
  //   const response = gateway.handleMessage(
  //     new Message(EMessage.Handshake, '1234'),
  //   )
  //   expect(response.id).toEqual('1234')
  //   expect(response.type).toEqual(EMessage.Acknowledgment)
  // })
})
