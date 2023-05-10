import { Test } from '@nestjs/testing'

import { AppService } from './app.service'
import { UR, UREncoder } from '@ngraveio/bc-ur'

describe('AppService', () => {
  let service: AppService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile()

    service = app.get<AppService>(AppService)
  })

  describe('getData', () => {
    it('should return "Welcome to bristle!"', () => {
      expect(service.welcomeMessage).toEqual(AppService.welcomeMessage)
    })

    it('should verify the payload', () => {
      const message = { message1: 'property1' }
      const messageBuffer = Buffer.from(JSON.stringify(message))

      const ur = UR.fromBuffer(messageBuffer)
      const maxFragmentLength = 150
      const firstSeqNum = 0

      const encoder = new UREncoder(ur, maxFragmentLength, firstSeqNum)

      const part = encoder.nextPart()

      expect(service.verifyPayload([part])).toBe(JSON.stringify(message))
    })
  })
})
