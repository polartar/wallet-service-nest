import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { authenticator } from 'otplib'

// import { PairingService } from '../pairing/pairing.service'
import { InjectRepository } from '@nestjs/typeorm'
import { DeviceEntity } from './device.entity'
import { Repository } from 'typeorm'
import { FindPairingDto } from './dto/FindPairingDto'
import { CreateDeviceDto } from './dto/CreateDeviceDto'

@Injectable()
export class TotpService {
  constructor(
    // private readonly pairingService: PairingService,
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
  ) {}

  async createDevice(hardwareId: string) {
    const device = new DeviceEntity()
    device.hardwareId = hardwareId

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

  async pair(createDeviceDto: CreateDeviceDto) {
    const device = await this.lookup({
      userId: createDeviceDto.userId,
      deviceId: createDeviceDto.deviceId,
    })
    if (!device) {
      throw new BadRequestException('Not found matched userId and deviceId')
    }

    if (!authenticator.check(createDeviceDto.otp, device.secret)) {
      throw new BadRequestException('Invalid token')
    }
    console.log({ device })

    device.serverProposedShard = createDeviceDto.serverProposedShard
    device.ownProposedShard = createDeviceDto.ownProposedShard
    device.passCodeKey = createDeviceDto.passCodeKey
    device.recoveryKey = createDeviceDto.recoveryKey
    this.deviceRepository.save(device)

    return device
  }

  async updatePassCode(deviceId: string, userId: number, passCodeKey: string) {
    const deviceEntity = await this.lookup({ userId, deviceId })
    if (deviceEntity) {
      deviceEntity.passCodeKey = passCodeKey
      return await this.deviceRepository.save(deviceEntity)
    } else {
      throw new BadRequestException('Not found matched userId and deviceId')
    }
  }

  async updateIsCloud(deviceId: string, userId: number, isCloud: boolean) {
    const deviceEntity = await this.lookup({ userId, deviceId })
    if (deviceEntity) {
      deviceEntity.isCloud = isCloud
      return await this.deviceRepository.save(deviceEntity)
    } else {
      throw new BadRequestException('Not found matched userId and deviceId')
    }
  }
}
