import { BadRequestException, Injectable } from '@nestjs/common'
import { authenticator } from 'otplib'
import { InjectRepository } from '@nestjs/typeorm'
import { DeviceEntity } from './device.entity'
import { Repository } from 'typeorm'
import { FindPairingDto } from './dto/find-paring-dto'
import * as Sentry from '@sentry/node'
import { IPair } from './totp.types'

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

  async createPair(pair: IPair) {
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
      throw new BadRequestException('Invalid token')
    }

    device.userId = pair.userId
    device.serverProposedShard = pair.serverProposedShard
    device.ownProposedShard = pair.ownProposedShard
    device.passCodeKey = pair.passCodeKey
    device.recoveryKey = pair.recoveryKey

    await this.deviceRepository.save(device)

    return device
  }

  async updatePassCode(deviceId: string, userId: string, passCodeKey: string) {
    const deviceEntity = await this.lookup({ userId, deviceId })
    if (deviceEntity) {
      deviceEntity.passCodeKey = passCodeKey
      return await this.deviceRepository.save(deviceEntity)
    } else {
      Sentry.captureMessage(
        `updatePassCode(): No found matched entity with userId(${userId}) and deviceId(${deviceId})`,
      )
      throw new BadRequestException(
        'No found the matched entity with userId and deviceId',
      )
    }
  }

  async updateIsCloud(deviceId: string, userId: string, isCloud: boolean) {
    const deviceEntity = await this.lookup({ userId, deviceId })
    if (deviceEntity) {
      deviceEntity.isCloud = isCloud
      return await this.deviceRepository.save(deviceEntity)
    } else {
      Sentry.captureMessage(
        `updateIsCloud(): Not found matched userId(${userId}) and deviceId(${deviceId})`,
      )
      throw new BadRequestException('Not found matched userId and deviceId')
    }
  }

  async verify(deviceId: string, userId: string, otp: string) {
    const device = await this.lookup({
      deviceId,
      userId,
    })
    if (!device) {
      Sentry.captureMessage(
        `verify(): No found the matched entity with userId(${userId}) and deviceId(${deviceId})`,
      )
      throw new BadRequestException(
        'No found the matched entity with userId and deviceId',
      )
    }

    return authenticator.check(otp, device.secret)
  }
}
