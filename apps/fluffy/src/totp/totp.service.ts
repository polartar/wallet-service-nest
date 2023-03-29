import { PairingEntity } from './../pairing/pairing.entity'
import { Injectable } from '@nestjs/common'
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

  async generate(userId: string, deviceId?: string) {
    let pairing
    let isNew = false
    if (deviceId) {
      pairing = await this.pairingService.lookup({
        userId,
        deviceId,
      })
    }

    if (!pairing) {
      pairing = await this.pairDevice(userId, deviceId)
      isNew = true
    }

    return {
      isNew,
      userId: pairing.userId,
      totp: pairing.secret,
      deviceId: pairing.deviceId,
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

    // Now, do the final check of TOTP
    return [
      'Validation', //
      authenticator.check(token, pairingEntity.secret),
    ]
  }
}
