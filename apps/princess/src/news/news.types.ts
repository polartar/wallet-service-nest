export interface INewsResponse {
  success: boolean
  data?: unknown
  error?: string
}

export enum ESort {
  ASC = 'asc',
  DESC = 'desc',
}

export interface INewsQuery {
  sort?: ESort
  countPerPage?: number
  pageNumber?: number
  startTime?: Date
  endTime?: Date
}
