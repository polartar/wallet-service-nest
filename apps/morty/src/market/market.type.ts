export enum ICoinType {
  ETHEREUM = 'ethereum',
  BITCOIN = 'bitcoin',
}

export interface IResponse {
  success: boolean
  data?: unknown
  error?: string
}
