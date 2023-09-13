import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { EEnvironment } from '../environments/environment.types'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppService {
  static welcomeMessage = 'magic is up and running'
  constructor(private configService: ConfigService) {
    this.checkEnvs()
  }

  get welcomeMessage() {
    return AppService.welcomeMessage
  }
  checkEnvs() {
    Object.keys(EEnvironment).map((envKey) => {
      const value = this.configService.get<string | boolean>(
        EEnvironment[envKey],
      )
      if (!value && value !== false) {
        throw new InternalServerErrorException(
          `Env variable(${envKey}) is missing`,
        )
      }
    })
  }
}
