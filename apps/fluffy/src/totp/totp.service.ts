import { BadRequestException, Injectable } from '@nestjs/common'
import { authenticator } from 'otplib'
import { InjectRepository } from '@nestjs/typeorm'
import { DeviceEntity } from './device.entity'
import { Repository } from 'typeorm'
import { FindPairingDto } from './dto/FindPairingDto'
import { CreateDeviceDto } from './dto/CreateDeviceDto'
import * as Sentry from '@sentry/node'
import * as SentryTracing from '@sentry/tracing'

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

  async pair(createDeviceDto: CreateDeviceDto, headers?: Headers) {
    SentryTracing && true // This is to ensure bundler won't optimise the sentry/tracing import (https://github.com/getsentry/sentry-javascript/issues/4731#issuecomment-1098530656)
    const sentry_trace_data = Sentry.extractTraceparentData(
      headers ? headers.get('sentry-trace') : '',
    )
    const sentry_txn = Sentry.startTransaction({
      op: 'pair',
      name: 'pair fn in fluffy',
      ...sentry_trace_data,
    })
    const device = await this.lookup({
      deviceId: createDeviceDto.deviceId,
    })
    if (!device) {
      Sentry.captureMessage(
        `Not found matched deviceId(${createDeviceDto.deviceId}) in pair`,
      )
      throw new BadRequestException('Not found matched deviceId')
    }
    Sentry.addBreadcrumb({
      category: 'pair',
      message: 'checking otp',
    })
    if (!authenticator.check(createDeviceDto.otp, device.secret)) {
      Sentry.captureMessage(`Invalid otp token(${createDeviceDto.otp}) in pair`)
      throw new BadRequestException('Invalid token')
    }

    device.userId = createDeviceDto.userId
    device.serverProposedShard = createDeviceDto.serverProposedShard
    device.ownProposedShard = createDeviceDto.ownProposedShard
    device.passCodeKey = createDeviceDto.passCodeKey
    device.recoveryKey = createDeviceDto.recoveryKey
    Sentry.addBreadcrumb({
      category: 'pair',
      message: 'saving device to db',
    })
    await this.deviceRepository.save(device)
    Sentry.addBreadcrumb({
      category: 'pair',
      message: 'save done',
    })
    sentry_txn.finish()
    return device
  }

  async updatePassCode(deviceId: string, userId: number, passCodeKey: string) {
    const deviceEntity = await this.lookup({ userId, deviceId })
    if (deviceEntity) {
      deviceEntity.passCodeKey = passCodeKey
      return await this.deviceRepository.save(deviceEntity)
    } else {
      Sentry.captureMessage(
        `Not found matched userId(${userId}) and deviceId(${deviceId}) in updatePassCode`,
      )
      throw new BadRequestException('Not found matched userId and deviceId')
    }
  }

  async updateIsCloud(deviceId: string, userId: number, isCloud: boolean) {
    const deviceEntity = await this.lookup({ userId, deviceId })
    if (deviceEntity) {
      deviceEntity.isCloud = isCloud
      return await this.deviceRepository.save(deviceEntity)
    } else {
      Sentry.captureMessage(
        `Not found matched userId(${userId}) and deviceId(${deviceId}) in updatePassCode`,
      )
      throw new BadRequestException('Not found matched userId and deviceId')
    }
  }

  async verify(deviceId: string, userId: number, otp: string) {
    const device = await this.lookup({
      deviceId,
      userId,
    })
    if (!device) {
      Sentry.captureMessage(
        `Not found matched userId(${userId}) and deviceId(${deviceId}) in updatePassCode`,
      )
      throw new BadRequestException('Not found matched userId and deviceId')
    }

    return authenticator.check(otp, device.secret)
  }
}
