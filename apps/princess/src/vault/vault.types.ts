export interface IRequest extends Request {
  accountId: number
}

export enum EAPIMethod {
  POST = 'post',
  GET = 'get',
}
export interface IResponse {
  success?: boolean
  data?: any
  error?: [string]
}
