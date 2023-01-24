import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { BadRequestException } from '@nestjs/common'

import { EAuth } from './auth.types'
import { Environment } from './../environments/environment.dev'
import { ConfigModule } from '@nestjs/config'

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
      ).rejects.toThrowError(BadRequestException)
    })
    it('should return gmail address', async () => {
      const response = await service.authorize({
        idToken:
          'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQzN2FhNTA0MzgxMjkzN2ZlNDM5NjBjYTNjZjBlMjI4NGI2ZmMzNGQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNjM4MDAxMjc3NzMwLTJucmdpOG9xY2szdG8yNjZxcHFqZG8wN2trc2NjcTFpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNjM4MDAxMjc3NzMwLTJucmdpOG9xY2szdG8yNjZxcHFqZG8wN2trc2NjcTFpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA0OTI3ODA0MDQxNTU1OTEzNTAxIiwiaGQiOiJuZ3JhdmUuaW8iLCJlbWFpbCI6Im11aGFtbWFkLmFiZHVsbGFoQG5ncmF2ZS5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiSzVJQ3hiNmdLUlprRnZQRnF2akttZyIsIm5hbWUiOiJNdWhhbW1hZCBBYmR1bGxhaCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BRWRGVHA3R3JKTDlSaFVWZTVWME1uNDFtM3NfYTZtcklkRk5UNExIM1huMz1zOTYtYyIsImdpdmVuX25hbWUiOiJNdWhhbW1hZCAiLCJmYW1pbHlfbmFtZSI6IkFiZHVsbGFoIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2NzQ0MDEyMjIsImV4cCI6MTY3NDQwNDgyMiwianRpIjoiOTc4ZWY3MWQ1MmRjZDI2NDkwMzdkZjYxNDVhZmFkZTVmN2I5MTIwMiJ9.Kg2Szqo4z9pWI_UK0ToGwDWwYSaOFgOayWWcMRx1tRLEaxSecWKqB4WAvbesxU7ilPARoEzXFpL2h63gvDW-R9ePbqRa5sDJ-fv5z3V93ygtqUN_EKP4WfYzik0MCNo8613f33iliYuDqQj92k1LokDDR9D8pMHAWOQpQaxyA2ttUFBpP14wpFEiiNeGTSZ619eep9ejksIM913sYeEHp3CnG8QWKj6S46_omPWQ86EnHdJXp4YdLUZU74TpJhGIybhEQfvkT_CGHxA6NzPhjCbEDRM7o1kkel4KZWdkdarCc88bCbWuBcfDQYLD69cAd99hhx2_D2mdLFFZECTMfg',
        type: EAuth.Google,
      })

      expect(response).toBe('muhammad.abdullah@ngrave.io')
    })
  })
})
