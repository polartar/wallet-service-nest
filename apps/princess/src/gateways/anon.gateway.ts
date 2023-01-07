import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common'
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'

import { Message } from '../oop'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AnonGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('anonymous')
  @UseInterceptors(ClassSerializerInterceptor)
  handleMessage(@MessageBody() payload: Message) {
    console.log('Got a message', payload)
    return Message.Ack(payload)
  }
}
