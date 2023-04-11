import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PairingEntity } from './../pairing/pairing.entity'
import { TotpService } from './totp.service'
import { DeviceEntity } from './device.entity'

describe('TotpService', () => {
  let service: TotpService

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
        TypeOrmModule.forFeature([DeviceEntity]),
      ],
      providers: [TotpService],
    }).compile()

    service = module.get<TotpService>(TotpService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create device from hardware id', async () => {
    const hardwareId = 'test hardware id'
    const device = await service.createDevice(hardwareId)
    expect(device.deviceId).not.toBeNull()
    expect(device.otp).not.toBeNull()
  })
})
