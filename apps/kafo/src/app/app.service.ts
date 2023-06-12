import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'

@Injectable()
export class AppService {
  static welcomeMessage = 'Kafo is up and running'

  constructor(private configService: ConfigService) {
    this.checkEnvs()
    // this.isProduction = this.configService.get<boolean>(
    //   EEnvironment.isProduction,
    // )
  }
  get welcome() {
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
