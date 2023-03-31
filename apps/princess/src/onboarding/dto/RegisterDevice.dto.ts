import { IsNotEmpty, IsNumber } from 'class-validator'

export class RegisterDeviceDto {
  @IsNotEmpty()
  @IsNumber()
  account_id: number

  @IsNotEmpty()
  opt: string
}
