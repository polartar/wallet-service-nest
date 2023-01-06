import { IsEnum, IsUUID } from 'class-validator'
import { randomUUID } from 'crypto'

import { EMessage, IData, IMessage } from './message.types'

export class Message implements IMessage {
  @IsEnum(EMessage)
  readonly type: EMessage

  @IsUUID(4)
  readonly id: string

  constructor(
    type: EMessage,
    id: string = randomUUID(),
    readonly content?: IData,
  ) {
    this.type = type
    this.id = id
  }

  public static Ack(msg: Message) {
    return new Message(EMessage.Acknowledgment, msg.id)
  }
}
