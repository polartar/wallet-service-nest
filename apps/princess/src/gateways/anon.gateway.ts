import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common'
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { Message } from '../oop'

@WebSocketGateway()
export class AnonGateway {
  @UseInterceptors(ClassSerializerInterceptor)
  @SubscribeMessage('anonymous')
  handleMessage(@MessageBody() payload: Message) {
    console.log('Got a message')
    return Message.Ack(payload)
  }
}
