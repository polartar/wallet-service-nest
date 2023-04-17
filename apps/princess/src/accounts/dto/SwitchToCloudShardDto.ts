import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
export class SwitchToCloudShardDto {
  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  device_id: string
}
