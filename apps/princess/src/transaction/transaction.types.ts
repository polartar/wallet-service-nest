export enum ENFTTypes {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}

export interface ITokenTransfer {
  id: string
  tokenId: string
  collectionId: string
  type: string
}
