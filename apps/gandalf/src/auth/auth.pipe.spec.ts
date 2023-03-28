import { BadRequestException } from '@nestjs/common'
import { LoginValidationPipe } from './auth.pipe'
import { IAuthData } from './auth.types'
import { EAuth } from '@rana/core'

describe('Auth Pipe', () => {
  const pipe = new LoginValidationPipe()
  it('Should reject bad tokens', () => {
    expect(() =>
      pipe.transform({
        idToken: '1234',
        type: EAuth.Google,
      }),
    ).toThrow(BadRequestException)
  })
  it('Should accept good tokens', () => {
    const authBody: IAuthData = {
      idToken: '123.456.789',
      type: EAuth.Google,
    }

    expect(pipe.transform(authBody)).toBe(authBody)
  })
})
