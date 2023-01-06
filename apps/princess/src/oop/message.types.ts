export interface IMessage {
  type: EMessage
  id?: string
  content?: IData
}

export enum EMessage {
  Acknowledgment = 'ACK',
  Handshake = 'HANDSHAKE',
}

export type IData =
  | string
  | boolean
  | number
  | null
  | {
      [key: string]: IData
    }
