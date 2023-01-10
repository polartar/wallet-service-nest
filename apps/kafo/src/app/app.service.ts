import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  static welcomeMessage = 'Kafo is up and running'

  get welcome() {
    return AppService.welcomeMessage
  }
}
