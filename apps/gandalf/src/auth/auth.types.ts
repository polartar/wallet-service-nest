export enum EAuth {
  Google = 'google',
  Apple = 'apple',
}

export type IAuthData = {
  idToken: string
  type: EAuth
}

export type IAuthResponse = {
  name: string
  email: string
}
