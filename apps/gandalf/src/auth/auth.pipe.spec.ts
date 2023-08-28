import { LoginValidationPipe } from './auth.pipe'
import { IAuthData } from './auth.types'
import { EAuth, EPlatform } from '@rana/core'

describe('Auth Pipe', () => {
  const pipe = new LoginValidationPipe()
  it('Should accept good tokens', () => {
    const authBody: IAuthData = {
      idToken: '123.456.789',
      type: EAuth.Google,
      platform: EPlatform.Android,
      accountId: '910f5dbe-d8dc-4480-8e3b-9ea9b1b8cf87',
    }

    expect(pipe.transform(authBody)).toBe(authBody)
  })
})
