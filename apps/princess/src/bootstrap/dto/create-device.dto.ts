import { ApiProperty } from '@nestjs/swagger'

export class CreateDeviceSwaggerResponse {
  @ApiProperty({
    example: '56733357XXX37PPPX6667P55HDX37PPPX6667P55NI======',
  })
  otpSecret: string

  @ApiProperty({
    example: '7e430da0-460b-47d7-b7da-c573bfccac21',
  })
  id: string

  @ApiProperty({
    example: 1,
  })
  accountId: number

  @ApiProperty({
    example:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk2OTcxODA4Nzk2ODI5YTk3MmU3OWE5ZDFhOWZmZjExY2Q2MWIxZTMiLCJ0eXAiOiJKV1QifQ',
  })
  accessToken: string

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOjE1NiwiaWRUb2tlbiI6Ijc0YWZhMDUwLTYxNGEtNGFhYy1iYTUzLWEwYmFmNDBjMjljYyIsImRldmljZUlkIjoiNzRhZmEwNTAtNjE0YS00YWFjLWJhNTMtYTBiYWY0MGMyOWNjIiwiaWF0IjoxNjg1NDQwMjI0LCJleHAiOjE2ODU1MjY2MjR9.mMv5f1Tje6kvYDQw2xzTKe9yD_p2UCvLjacx4Ba4Ee8',
  })
  refreshToken: string
}
