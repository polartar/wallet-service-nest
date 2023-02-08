import { Test, TestingModule } from '@nestjs/testing'
import { RickGateway } from './Rick.gateway'
import * as WebSocket from 'ws'
import { INestApplication } from '@nestjs/common'
// import { WsAdapter } from '@nestjs/platform-ws'

async function createNestApp(...gateways): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: gateways,
  }).compile()
  const app = testingModule.createNestApplication()
  // app.useWebSocketAdapter(new WsAdapter(app) as any)
  return app
}
describe('RickGateway', () => {
  let gateway: RickGateway
  let ws, ws2, app

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RickGateway],
    }).compile()
    gateway = module.get<RickGateway>(RickGateway)
    // app = module.createNestApplication()
    // app.useWebSocketAdapter(new WsAdapter(app) as any)
    // await app.init()
  })

  it('should be defined', () => {
    expect(gateway).toBeDefined()
  })

  // it(`should handle message`, async () => {
  //   // app = await createNestApp(RickGateway)
  //   // await app.listen(3000)

  //   // ws = new WebSocket('ws://localhost:8080')
  //   const address = app.getHttpServer().listen().address()
  //   const baseAddress = `http://[${address.address}]:${address.port}`
  //   console.log({ baseAddress })
  //   const socket = new WebSocket(baseAddress)

  //   await new Promise((resolve) => socket.on('open', resolve))
  //   socket.on('open', () => {
  //     console.log('I am connected! YEAAAP')
  //     // done()
  //   })
  //   //   socket
  //   //     .send(
  //   //       JSON.stringify({
  //   //         event: 'rick',
  //   //         data: {
  //   //           accountId: 1,
  //   //         },
  //   //       }),
  //   //     )
  //   //     .then((res) => {
  //   //       console.log({ res })
  //   //     })
  // })
})
