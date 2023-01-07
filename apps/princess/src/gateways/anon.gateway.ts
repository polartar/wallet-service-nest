import {
  ClassSerializerInterceptor,
  UseFilters,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common'
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server } from 'socket.io'

import { WebSocketExceptionFilter } from '../filters/web-socket-exception.filter'
import { Message } from '../oop'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseFilters(WebSocketExceptionFilter)
export class AnonGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('anonymous')
  @UseInterceptors(ClassSerializerInterceptor)
  handleMessage(
    @MessageBody(
      new ValidationPipe({
        expectedType: Message,
        transform: true,
      }),
    )
    payload: Message,
  ): Message {
    console.log('Got a message', payload, payload instanceof Message)
    return Message.Ack(payload)
  }
}
