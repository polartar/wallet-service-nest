import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

export const IS_MIDDLE_KEY = 'isMiddle'
export const Middle = () => SetMetadata(IS_MIDDLE_KEY, true)
