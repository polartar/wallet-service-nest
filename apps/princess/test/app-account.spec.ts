/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { INestApplication } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from '../src/app/app.controller'
import { AppService } from '../src/app/app.service'

import { AppController as FluffyController } from '../../fluffy/src/app/app.controller'
import { AppService as FluffyService } from '../../fluffy/src/app/app.service'

import axios from 'axios'
import { OnboardingController } from '../src/onboarding/onboarding.controller'
import { OnboardingService } from '../src/onboarding/onboarding.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../src/environments/environment.dev'
import { AppModule } from '../src/app/app.module'
import { AppModule as FluffyModule } from '../../fluffy/src/app/app.module'
import { OnboardingModule } from '../src/onboarding/onboarding.module'
import { TotpModule } from '../../fluffy/src/totp/totp.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DeviceEntity } from '../../fluffy/src/totp/device.entity'

describe('Princess System Test', () => {
  let app: INestApplication
  let fluffyApp: INestApplication

  beforeAll(async () => {
    // Initialize and start the server
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        OnboardingModule,
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
    }).compile()

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    await app.listen(3000)

    const fluffyModule: TestingModule = await Test.createTestingModule({
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
        FluffyModule,
        TotpModule,
      ],
    }).compile()

    fluffyApp = fluffyModule.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    await fluffyApp.listen(3335)
  })

  describe('Service health check', () => {
    it('Welcome message in Princess', async () => {
      const data = await axios.get('http://localhost:3000/')
      expect(data.status).toEqual(200)
      expect(await data.data).toEqual(AppService.welcomeMessage)
    })

    it('Welcome message in Fluffy', async () => {
      const data = await axios.get('http://localhost:3335/')
      expect(data.status).toEqual(200)
      expect(await data.data).toEqual(FluffyService.message)
    })
  })

  describe('Onboarding Controller', () => {
    it('should create device', async () => {
      const data = await axios.post('http://localhost:3000/onboarding/device')
      expect(data.status).toEqual(201)
      expect(await data.data.secret).toBeDefined()
    })

    it('should login', async () => {
      const data = await axios.post('http://localhost:3000/onboarding/device')
      expect(data.status).toEqual(200)
      expect(await data.data.secret).toBeDefined()
    })
  })
})
