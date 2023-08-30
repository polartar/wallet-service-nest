import { IData } from '@rana/core'

export interface IMessage {
  type: EMessage
  id?: string
  content?: IData
}

export enum EMessage {
  Acknowledgment = 'ACK',
  Handshake = 'HANDSHAKE',
}
