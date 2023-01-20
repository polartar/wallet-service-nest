import { Injectable } from '@nestjs/common'
import { IAuthData } from './auth.controller'
// import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
    authorize(data: IAuthData) {
        if (data.type === 'GOOGLE') {
            

        }
    }
}
