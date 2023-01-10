import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  static welcomeMessage = 'Anton is up and running'
  get welcomeMessage() {
    return AppService.welcomeMessage
  }
}
