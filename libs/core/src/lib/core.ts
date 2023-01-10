export type IData =
  | string
  | boolean
  | number
  | null
  | {
      [key: string]: IData
    }
