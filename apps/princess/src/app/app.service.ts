import { Get, Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  static readonly welcomeMessage = 'Princess is up and running!'
  get welcomeMessage() {
    return AppService.welcomeMessage
  }
}
