import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'

import { Environment } from './../environments/environment.dev'
import { ConfigModule } from '@nestjs/config'
import { EAuth } from '@rana/core'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [Environment] })],
      providers: [AuthService],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('Authorize', () => {
    it('should throw error', () => {
      expect(
        service.authorize({ idToken: 'test', type: EAuth.Google }),
      ).rejects.toThrowError('Invalid Id token')
    })
    // it('should return gmail address', async () => {
    //   const response = await service.authorize({
    //     idToken:
    //       'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk2OTcxODA4Nzk2ODI5YTk3MmU3OWE5ZDFhOWZmZjExY2Q2MWIxZTMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNjM4MDAxMjc3NzMwLTJucmdpOG9xY2szdG8yNjZxcHFqZG8wN2trc2NjcTFpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNjM4MDAxMjc3NzMwLTJucmdpOG9xY2szdG8yNjZxcHFqZG8wN2trc2NjcTFpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA0OTI3ODA0MDQxNTU1OTEzNTAxIiwiaGQiOiJuZ3JhdmUuaW8iLCJlbWFpbCI6Im11aGFtbWFkLmFiZHVsbGFoQG5ncmF2ZS5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiQ0tiSnZxTUhOeGJMSDk2RTBPV3E5USIsIm5hbWUiOiJNdWhhbW1hZCBBYmR1bGxhaCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BR05teXhac01ROV9FdU9hOGR6dDNzaE5kc2didElJWnpMYmpWaXFJU0x0dT1zOTYtYyIsImdpdmVuX25hbWUiOiJNdWhhbW1hZCAiLCJmYW1pbHlfbmFtZSI6IkFiZHVsbGFoIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2ODE5MjA0MDksImV4cCI6MTY4MTkyNDAwOSwianRpIjoiNzE1ZTExNWZlNGFlMTliOTA0ZTgzN2I5MTgyYmUwMWZiZjBlOTc0YyJ9.VrCL7t7Z6A0X2w2TgJATJoFL6VyXCRiKobFzdtDy_dQv7rb_WsmGtBWKfzg6Q8FQ9570aTuLrECNbf-eJbN_6-YSyroGuo0S1DCTl90OXX9RozgbDE7rY8MoW-XxTELWPTZ2zIgaafojBRFdJyKqGfzerbhSvU6pu2MtEgTgRHMAqP9Gn6F9D8vftk9riqs1mu16QSqca11FYg9e5yK1GffiPQBnXwpRH_KmJ28Y2KFOTPAorUmsarya9wePl1cf1v9PCRTziFGJCT7IEc_Jlly0-eNXsCYn14IyKsCoA7GqeOiehg_FcB7n9i4fCws2ZQ9c6SqjpKUocPzdBJ5glA',
    //     type: EAuth.Google,
    //   })

    //   expect(response.email).toBe('muhammad.abdullah@ngrave.io')
    // })
  })
})
