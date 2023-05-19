import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TotpService } from './totp.service'
import { DeviceEntity } from './device.entity'
import { authenticator } from 'otplib'
import { BadRequestException } from '@nestjs/common'

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
    const device = await service.createDevice()
    expect(device.deviceId).not.toBeNull()
    expect(device.otp).not.toBeNull()
  })

  it('should create pair', async () => {
    const device = await service.createDevice()
    const token = authenticator.generate(device.otp)
    await service.pair({
      userId: 1,
      deviceId: device.deviceId,
      serverProposedShard: 'server shard',
      ownProposedShard: 'own shard',
      passCodeKey: 'pass code',
      recoveryKey: 'recovery key',
      otp: token,
    })

    expect(
      (
        await service.lookup({
          userId: 1,
          deviceId: device.deviceId,
        })
      ).deviceId,
    ).toBe(device.deviceId)
  })

  it('should throw error when deviceId not exists', async () => {
    try {
      await service.pair({
        userId: 1,
        deviceId: 'device.deviceId',
        serverProposedShard: 'server shard',
        ownProposedShard: 'own shard',
        passCodeKey: 'pass code',
        recoveryKey: 'recovery key',
        otp: 'token',
      })
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException)
    }
  })

  it('should throw error when invalid otp token', async () => {
    const device = await service.createDevice()
    try {
      await service.pair({
        userId: 1,
        deviceId: device.deviceId,
        serverProposedShard: 'server shard',
        ownProposedShard: 'own shard',
        passCodeKey: 'pass code',
        recoveryKey: 'recovery key',
        otp: 'token',
      })
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException)
    }
  })
})
