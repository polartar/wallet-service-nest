export interface INewsResponse {
  success: boolean
  data?: unknown
  error?: string
}

export enum ESort {
  ASC = 'asc',
  DESC = 'desc',
}
