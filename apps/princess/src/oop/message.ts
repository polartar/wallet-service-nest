import { IsEnum, IsUUID } from 'class-validator'
import { randomUUID } from 'crypto'

import { EMessage, IData, IMessage } from './message.types'

export class Message implements IMessage {
  @IsEnum(EMessage)
  readonly type: EMessage

  @IsUUID(4)
  readonly id: string = randomUUID()

  constructor(partial: Partial<Message>) {
    Object.assign(this, partial)
  }

  public static Ack(msg: Message) {
    return new Message({
      type: EMessage.Acknowledgment,
      id: msg.id,
    })
  }
}
