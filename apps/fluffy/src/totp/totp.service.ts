import { Injectable } from '@nestjs/common'
import { authenticator } from 'otplib'
import { PairingService } from '../pairing/pairing.service'

@Injectable()
export class TotpService {
  constructor(private readonly pairingService: PairingService) {}

  private async pairDevice(userID: string) {
    return this.pairingService.create({
      userID: userID,
    })
  }

  async generate(userID: string) {
    const pairing = await this.pairDevice(userID)

    return {
      userID: pairing.userID,
      totp: pairing.secret,
      deviceID: pairing.deviceID,
    }
  }

  async verify(userID: string, deviceID: string, token: string) {
    const pairingEntity = await this.pairingService.lookup({
      userID,
      deviceID,
    })
    // First, is there a pairing?
    if (pairingEntity === null) {
      return [false, 'Not a paired device']
    }
    // Now, do the final check of TOTP
    return ['Validation', authenticator.check(token, pairingEntity.secret)]
  }
}
