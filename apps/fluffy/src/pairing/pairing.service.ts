import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreatePairingDto } from './dto/create-pairing.dto'
import { FindPairingDto } from './dto/find-pairing.dto'
import { PairingEntity } from './pairing.entity'
import { DeviceEntity } from './device.entity'

@Injectable()
export class PairingService {
  constructor(
    @InjectRepository(PairingEntity)
    private readonly pairingRepository: Repository<PairingEntity>,
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
  ) {}

  // create(createPairingDto: CreatePairingDto): Promise<PairingEntity> {
  //   // const pair = new PairingEntity()
  //   // pair.userId = createPairingDto.userId
  //   // pair.deviceId = createPairingDto.deviceId

  //   // return this.pairingRepository.save(pair)
  // }

  // async pair(createPairingDto: CreatePairingDto): Promise<DeviceEntity> {
  //   const device =await this.lookup({userId:createPairingDto.userId, deviceId: createPairingDto.deviceId})
  //   device.

  //   return this.deviceRepository.save(device)
  // }

  async createDevice(hardwareId: string): Promise<DeviceEntity> {
    const device = new DeviceEntity()
    device.hardwareId = hardwareId

    return this.deviceRepository.save(device)
  }

  lookup(findPairingDto: FindPairingDto): Promise<PairingEntity> {
    return this.pairingRepository.findOne({
      where: findPairingDto,
    })
  }
  async lookupHardwareId(hardwareId: string): Promise<DeviceEntity> {
    return await this.deviceRepository.findOne({
      where: { hardwareId },
    })
  }

  async lookupDeviceId(deviceId: string): Promise<DeviceEntity> {
    return await this.deviceRepository.findOne({
      where: { deviceId },
    })
  }
}
