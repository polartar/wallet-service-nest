import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PairingEntity } from './../pairing/pairing.entity'
import { TotpService } from './totp.service'
import { PairingService } from '../pairing/pairing.service'
import { DeviceEntity } from '../pairing/device.entity'

describe('TotpService', () => {
  let service: TotpService
  let paringService: PairingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            DeviceEntity, //
            PairingEntity,
          ],
        }),
        TypeOrmModule.forFeature([DeviceEntity, PairingEntity]),
      ],
      providers: [TotpService, PairingService],
    }).compile()
    paringService = module.get<PairingService>(PairingService)

    service = module.get<TotpService>(TotpService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create device from hardware id', async () => {
    const hardwareId = 'test hardware id'
    await service.createDevice(hardwareId)
    const device = await paringService.lookupHardwareId(hardwareId)
    expect(device.hardwareId).toBe(hardwareId)
  })

  it('should create new pair', async () => {
    const userId = '1'
    const deviceId = '22e851f7-ed71-4586-abb6-8baa11a22ab5'
    expect((await service.generate(userId, deviceId)).is_new).toBeTruthy()
    const pair = await paringService.lookup({ userId, deviceId })
    expect(pair.deviceId).toBe(deviceId)
  })
  it('should not create pair if exist', async () => {
    const userId = '1'
    const deviceId = '22e851f7-ed71-4586-abb6-8baa11a22ab5'
    await service.generate(userId, deviceId)
    expect((await service.generate(userId, deviceId)).is_new).toBeFalsy()
    const pair = await paringService.lookup({ userId, deviceId })
    expect(pair.deviceId).toBe(deviceId)
  })
})
