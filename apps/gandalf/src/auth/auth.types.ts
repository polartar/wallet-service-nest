export enum EAuth {
  Google = 'google',
  Apple = 'apple',
}

export type IAuthData = {
  idToken: string
  type: EAuth
}
