import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  static readonly message = 'Fluffy is up and running'
  get message() {
    return AppService.message
  }
}
