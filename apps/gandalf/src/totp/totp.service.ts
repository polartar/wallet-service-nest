import { BadRequestException, Injectable } from '@nestjs/common'
import { authenticator } from 'otplib'
import { InjectRepository } from '@nestjs/typeorm'
import { DeviceEntity } from './device.entity'
import { Repository } from 'typeorm'
import { FindPairingDto } from './dto/find-paring-dto'
import * as Sentry from '@sentry/node'
import { CheckPairingDto } from './dto/check-pairing-dto'

@Injectable()
export class TotpService {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
  ) {}

  async createDevice() {
    const device = new DeviceEntity()

    await this.deviceRepository.save(device)
    return {
      otp: device.secret,
      deviceId: device.deviceId,
    }
  }

  lookup(findPairingDto: FindPairingDto): Promise<DeviceEntity> {
    return this.deviceRepository.findOne({
      where: findPairingDto,
    })
  }

  async checkPair(pair: CheckPairingDto) {
    const device = await this.lookup({
      deviceId: pair.deviceId,
    })
    if (!device) {
      Sentry.captureMessage(
        `pair(): No found the matched entity with deviceId(${pair.deviceId})`,
      )
      throw new BadRequestException('No found matched deviceId')
    }

    if (!authenticator.check(pair.otp, device.secret)) {
      Sentry.captureMessage(`Invalid otp token(${pair.otp}) in pair()`)
      throw new BadRequestException('Invalid otp token')
    }

    device.userId = pair.userId

    this.deviceRepository.save(device)

    return device
  }
}
