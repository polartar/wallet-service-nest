export interface IRequest extends Request {
  accountId: number
}

export enum EAPIMethod {
  POST = 'post',
  GET = 'get',
}
export interface IResponse {
  success?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  error?: [string]
}
