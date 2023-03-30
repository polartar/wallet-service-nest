import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { authenticator } from 'otplib'

import { PairingService } from '../pairing/pairing.service'

@Injectable()
export class TotpService {
  constructor(private readonly pairingService: PairingService) {}

  private async pairDevice(userId: string, deviceId?: string) {
    return this.pairingService.create({
      userId,
      deviceId,
    })
  }

  async createDevice(hardwareId: string) {
    const device = await this.pairingService.createDevice(hardwareId)

    return {
      otp: device.secret,
      device_id: device.deviceId,
    }
  }

  async generate(userId: string, deviceId: string) {
    let pairing
    let isNew = false
    try {
      if (deviceId) {
        pairing = await this.pairingService.lookup({
          userId,
          deviceId,
        })
      }

      if (!pairing) {
        this.pairingService.createDevice(deviceId) // need to discuss the parameter
        pairing = await this.pairDevice(userId, deviceId)
        isNew = true
      }

      return {
        is_new: isNew,
      }
    } catch (err) {
      throw InternalServerErrorException
    }
  }

  async verify(userId: string, deviceId: string, token: string) {
    const pairingEntity = await this.pairingService.lookup({
      userId,
      deviceId,
    })

    // First, is there a pairing?
    if (pairingEntity === null) {
      return [
        false, //
        'Not a paired device',
      ]
    }
    const deviceEntity = await this.pairingService.lookupDeviceId(
      pairingEntity.deviceId,
    )

    // Now, do the final check of TOTP
    return [
      'Validation', //
      authenticator.check(token, deviceEntity.secret),
    ]
  }
}
