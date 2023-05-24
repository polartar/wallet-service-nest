import { ApiProperty } from '@nestjs/swagger'

export class CreateDeviceSwaggerResponse {
  @ApiProperty({
    example: '56733357XXX37PPPX6667P55HDX37PPPX6667P55NI======',
  })
  secret: string

  @ApiProperty({
    example: '7e430da0-460b-47d7-b7da-c573bfccac21',
  })
  device_id: string

  @ApiProperty({
    example: 1,
  })
  account_id: number

  @ApiProperty({
    example:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk2OTcxODA4Nzk2ODI5YTk3MmU3OWE5ZDFhOWZmZjExY2Q2MWIxZTMiLCJ0eXAiOiJKV1QifQ',
  })
  access_token: string
}
