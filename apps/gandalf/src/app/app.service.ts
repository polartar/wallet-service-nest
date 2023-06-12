import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {
    this.checkEnvs()
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

  getData(): { message: string } {
    return { message: 'Welcome to gandalf!' }
  }
}
