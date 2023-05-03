import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  static readonly welcomeMessage = 'Rick is up and running!'
  get welcomeMessage() {
    return AppService.welcomeMessage
  }
}
