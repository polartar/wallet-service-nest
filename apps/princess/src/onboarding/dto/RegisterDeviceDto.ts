import { IsUUID } from 'class-validator'

export class RegisterDeviceDto {
  @IsUUID()
  device_id!: string
}
