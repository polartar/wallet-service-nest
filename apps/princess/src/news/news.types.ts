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
  countPerPage?: number
  pageNumber?: number
  startTime?: Date
  endTime?: Date
}
