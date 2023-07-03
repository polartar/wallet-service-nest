import { ECoinTypes } from '@rana/core'

export interface INewsResponse {
  success: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  error?: string
}

export enum ESort {
  ASC = 'asc',
  DESC = 'desc',
}

export interface INewsQuery {
  sort?: ESort
  'count-per-page'?: number
  'page-number'?: number
  'start-time'?: Date
  'end-time'?: Date
  coin?: ECoinTypes
}
