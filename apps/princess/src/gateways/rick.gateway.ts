import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
type IRickSocketData = {
  accountId: string
}
@WebSocketGateway() //, { namespace: 'rick', transports: ['websocket'] })
export class RickGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('rick')
  async handleMessage(
    @MessageBody()
    data: IRickSocketData,
  ) {
    this.server.emit('balance_history', JSON.stringify({ balance: 123 }))
    // return await this.test(data.accountId)
  }

  async test(id) {
    return id
  }
}
