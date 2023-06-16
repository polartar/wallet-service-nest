/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IResponse {
  success?: boolean
  data?: any
  error?: [string]
}

export enum EAPIMethod {
  POST = 'post',
  GET = 'get',
}

export enum ENFTTypes {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}
