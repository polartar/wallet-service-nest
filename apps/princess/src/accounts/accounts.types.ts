import { Request } from '@nestjs/common'

export enum EAPIMethod {
  POST = 'post',
  GET = 'get',
}

export interface IRequest extends Request {
  accountId: number
}
