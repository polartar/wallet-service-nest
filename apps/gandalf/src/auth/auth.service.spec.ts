import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { BadRequestException } from '@nestjs/common'
import { IAuthType } from './auth.controller'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
        service.authorize({ idToken: 'test', type: IAuthType.GOOGLE }),
      ).rejects.toThrowError(BadRequestException)
    })
    it('should return gmail address', async () => {
      const response = await service.authorize({
        idToken:
          'eyJhbGciOiJSUzI1NiIsImtpZCI6ImFmYzRmYmE2NTk5ZmY1ZjYzYjcyZGM1MjI0MjgyNzg2ODJmM2E3ZjEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNjM4MDAxMjc3NzMwLTJucmdpOG9xY2szdG8yNjZxcHFqZG8wN2trc2NjcTFpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNjM4MDAxMjc3NzMwLTJucmdpOG9xY2szdG8yNjZxcHFqZG8wN2trc2NjcTFpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA0OTI3ODA0MDQxNTU1OTEzNTAxIiwiaGQiOiJuZ3JhdmUuaW8iLCJlbWFpbCI6Im11aGFtbWFkLmFiZHVsbGFoQG5ncmF2ZS5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiXzJsZGlndV9NUGp0X21aVnlFdFNKUSIsIm5hbWUiOiJNdWhhbW1hZCBBYmR1bGxhaCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BRWRGVHA3R3JKTDlSaFVWZTVWME1uNDFtM3NfYTZtcklkRk5UNExIM1huMz1zOTYtYyIsImdpdmVuX25hbWUiOiJNdWhhbW1hZCAiLCJmYW1pbHlfbmFtZSI6IkFiZHVsbGFoIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2NzQ1MjQxNTYsImV4cCI6MTY3NDUyNzc1NiwianRpIjoiNDM5YjQ1ZjBiZDdiNjY2MmIzNzMxZDExOTM3ZDBjYzIzNDJjMzUzOSJ9.PTftiofMSmR4ln6R2Eu2Fcu2sk97ED8kFfXsIvacxKrs_J7pRv3-kwo_DA4NtdGUa97DkFjrwJh8gLOHcvp8lYaw_KTJi3Sw9raIhB1sBIeSyO8aBjdfSz6IwusH7KFxUU86mdGpVYJzEQiZkUVqz2_i6uZv1MiRGmqEfjckX65ntVjpsjXu2EYH0LrlkHpPd2DV2vNrULKAe70JK3CkCJREn8B6cEO70vMxDXF5gUPym19rRuXtf5YBLxpyO2cfUQaEb4_rdgyOlIit2yCjd5td8C86Au3xs4nhPtnnvgs38tGxZGho6wurYEAt86cEUKhRYC2tF0NumvxyuEk9rQ',
        type: IAuthType.GOOGLE,
      })

      expect(response).toBe('muhammad.abdullah@ngrave.io')
    })
  })
})
