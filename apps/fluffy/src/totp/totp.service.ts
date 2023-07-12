import { BadRequestException, Injectable } from '@nestjs/common'
import { authenticator } from 'otplib'
import { InjectRepository } from '@nestjs/typeorm'
import { DeviceEntity } from './device.entity'
import { Repository } from 'typeorm'
import { FindPairingDto } from './dto/find-paring-dto'
import * as Sentry from '@sentry/node'
import { CreatePairingDto } from './dto/create-pairing-dto'
import { UpdateShardsDto } from './dto/update-shards-dto'

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

  async createPair(pair: CreatePairingDto) {
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
    device.serverShard = pair.serverShard
    device.accountShard = pair.accountShard
    device.passcodeKey = pair.passcodeKey
    device.recoveryKey = pair.recoveryKey
    device.iCloudShard = pair.iCloudShard
    device.vaultShard = pair.vaultShard

    await this.deviceRepository.save(device)

    return device
  }

  // async updatePassCode(deviceId: string, userId: string, passCodeKey: string) {
  //   const deviceEntity = await this.lookup({ userId, deviceId })
  //   if (deviceEntity) {
  //     deviceEntity.passcodeKey = passCodeKey
  //     return await this.deviceRepository.save(deviceEntity)
  //   } else {
  //     Sentry.captureMessage(
  //       `updatePassCode(): No found matched entity with userId(${userId}) and deviceId(${deviceId})`,
  //     )
  //     throw new BadRequestException(
  //       'No found the matched entity with userId and deviceId',
  //     )
  //   }
  // }

  async updateShards(deviceId, data: UpdateShardsDto) {
    const deviceEntity = await this.lookup({
      // userId: data.userId,
      deviceId: deviceId,
    })

    if (deviceEntity) {
      Object.keys(data).map((key) => {
        deviceEntity[key] = data[key]
        return key
      })
      return await this.deviceRepository.save(deviceEntity)
    } else {
      Sentry.captureMessage(
        `updateIsCloud(): Not found matched userId(${data.userId}) and deviceId(${deviceId})`,
      )
      throw new BadRequestException('Not found matched userId and deviceId')
    }
  }

  async getShards(deviceId, accountId) {
    const deviceEntity = await this.lookup({
      // userId: accountId,
      deviceId: deviceId,
    })

    if (deviceEntity) {
      return deviceEntity
    } else {
      Sentry.captureMessage(
        `updateIsCloud(): Not found matched userId(${accountId}) and deviceId(${deviceId})`,
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
