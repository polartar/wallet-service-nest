import { ApiProperty } from '@nestjs/swagger'
import { EAuth } from '@rana/core'
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator'

export class SignInDto {
  @ApiProperty({
    description: 'auth type',
    enum: [EAuth.Apple, EAuth.Google],
  })
  @IsEnum(EAuth)
  type: EAuth

  @ApiProperty({ description: 'token of Google or Apple login' })
  @IsNotEmpty()
  id_token: string

  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  @IsUUID(4)
  device_id: string

  @ApiProperty({ description: 'one time password' })
  @IsNotEmpty()
  otp: string

  @ApiProperty({ description: 'server shard' })
  @IsNotEmpty()
  server_proposed_shard: string

  @ApiProperty({ description: 'own shard' })
  @IsNotEmpty()
  own_proposed_shard: string

  @ApiProperty({ description: 'pass key' })
  @IsNotEmpty()
  passcode_key: string

  @ApiProperty({ description: 'recovery code' })
  @IsNotEmpty()
  recovery_key: string
}

export class SignInSwaggerResponse {
  @ApiProperty({
    example: '910f5dbe-d8dc-4480-8e3b-9ea9b1b8cf87',
  })
  account_id: string

  @ApiProperty({
    example: {
      name: 'Michael',
      email: 'test@gmail.com',
      id: 1,
    },
  })
  account: string

  @ApiProperty({
    example:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk2OTcxODA4Nzk2ODI5YTk3MmU3OWE5ZDFhOWZmZjExY2Q2MWIxZTMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxNDE5MTAxNzU3NjMtODZhYTRmbnJmbXFiMGdubGYwYnU1Z2trOTIzamxhaTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxNDE5MTAxNzU3NjMtM21wZHBuNGRqN2g1MmZ1NXIxajhvcmdybWU2bXJ2OWQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDc3MzY5OTA5MjI2NjM5ODk2NjMiLCJoZCI6Im5ncmF2ZS5pbyIsImVtYWlsIjoiY2FpcXVlLmNydXpAbmdyYXZlLmlvIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJUZkRlMlBVSGE2RGxEcmJaQW1IcWRRIiwibm9uY2UiOiJHVmdYU2xoSFFrOTkxMGNacmNDWkZPakFsTUFNNnNheWptbUFLOTVrM1FJIiwibmFtZSI6IkNhaXF1ZSBDcnV6IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FHTm15eFp6WVBEQnpRWEE4WmlCeVNBSVhpdXBTTF9iNkQtS2FzSFVkV1VKPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkNhaXF1ZSIsImZhbWlseV9uYW1lIjoiQ3J1eiIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjgyMDA5MTg0LCJleHAiOjE2ODIwMTI3ODR9.hYRJYGTULT-9JheUudDmCWTDPIlCYlBhB7gSeDexbFWdH5mIpAdCjTpi_WNfXYglYPaQvLJcZ-C31sM2-KFdiGNuZ-vJ0VVzmyrIDqnEEtplKnUxbChVAd4YnfQSFeyJoRf8HRi2d5Q2BiqtF0z2IlY_nuuLIgGPDe9umkQ9kekGbZD5fgA_zuanOd068V2xtf24WNZadbb9cYk0UQd96x98luCARaA9s-JtUQT4ftL-VtJKF1g8kcF7TjLwhKSS59szgcW27ES8652rF5Rc8_SnYDjdr6-k5QE9JSFN2QdyDHatCEYBM7ERNDf-X5bacoAFTwupccQEa5fi3cKpcw',
  })
  access_token: string

  @ApiProperty({
    example:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk2OTcxODA4Nzk2ODI5YTk3MmU3OWE5ZDFhOWZmZjExY2Q2MWIxZTMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxNDE5MTAxNzU3NjMtODZhYTRmbnJmbXFiMGdubGYwYnU1Z2trOTIzamxhaTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxNDE5MTAxNzU3NjMtM21wZHBuNGRqN2g1MmZ1NXIxajhvcmdybWU2bXJ2OWQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDc3MzY5OTA5MjI2NjM5ODk2NjMiLCJoZCI6Im5ncmF2ZS5pbyIsImVtYWlsIjoiY2FpcXVlLmNydXpAbmdyYXZlLmlvIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJUZkRlMlBVSGE2RGxEcmJaQW1IcWRRIiwibm9uY2UiOiJHVmdYU2xoSFFrOTkxMGNacmNDWkZPakFsTUFNNnNheWptbUFLOTVrM1FJIiwibmFtZSI6IkNhaXF1ZSBDcnV6IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FHTm15eFp6WVBEQnpRWEE4WmlCeVNBSVhpdXBTTF9iNkQtS2FzSFVkV1VKPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkNhaXF1ZSIsImZhbWlseV9uYW1lIjoiQ3J1eiIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjgyMDA5MTg0LCJleHAiOjE2ODIwMTI3ODR9.hYRJYGTULT-9JheUudDmCWTDPIlCYlBhB7gSeDexbFWdH5mIpAdCjTpi_WNfXYglYPaQvLJcZ-C31sM2-KFdiGNuZ-vJ0VVzmyrIDqnEEtplKnUxbChVAd4YnfQSFeyJoRf8HRi2d5Q2BiqtF0z2IlY_nuuLIgGPDe9umkQ9kekGbZD5fgA_zuanOd068V2xtf24WNZadbb9cYk0UQd96x98luCARaA9s-JtUQT4ftL-VtJKF1g8kcF7TjLwhKSS59szgcW27ES8652rF5Rc8_SnYDjdr6-k5QE9JSFN2QdyDHatCEYBM7ERNDf-X5bacoAFTwupccQEa5fi3cKpcw',
  })
  refresh_token: string

  @ApiProperty({
    example: 'server shard',
  })
  server_shard: string

  @ApiProperty({
    example: 'pass code',
  })
  passcode_key: string
  @ApiProperty({
    example: 'recovery key',
  })
  recovery_key: string
}
