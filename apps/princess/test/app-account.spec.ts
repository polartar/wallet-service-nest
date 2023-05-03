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
import { AppService as GandalfService } from '../../gandalf/src/app/app.service'

import axios from 'axios'
import { OnboardingController } from '../src/onboarding/onboarding.controller'
import { OnboardingService } from '../src/onboarding/onboarding.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../src/environments/environment.dev'
import { AppModule } from '../src/app/app.module'
import { AppModule as FluffyModule } from '../../fluffy/src/app/app.module'
import { AppModule as GandalfModule } from '../../gandalf/src/app/app.module'
import { AppModule as RickModule } from '../../rick/src/app/app.module'

import { OnboardingModule } from '../src/onboarding/onboarding.module'
import { TotpModule } from '../../fluffy/src/totp/totp.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DeviceEntity } from '../../fluffy/src/totp/device.entity'

import { AuthModule } from '../../gandalf/src/auth/auth.module'
import { AuthService } from '../../gandalf/src/auth/auth.service'
import { AccountEntity } from '../../gandalf/src/account/account.entity'
import { AccountModule as GandalfAccountModule } from '../../gandalf/src/account/account.module'

import { WalletEntity } from '../../rick/src/wallet/wallet.entity'
import { AddressEntity } from '../../rick/src/wallet/address.entity'
import { RickAccountEntity } from '../../rick/src/account/account.entity'
import { HistoryEntity } from '../../rick/src/wallet/history.entity'
import { PortfolioModule } from '../../rick/src/portfolio/portfolio.module'
import { WalletModule } from '../../rick/src/wallet/wallet.module'
import { AccountModule as RickAccountModule } from '../../rick/src/account/account.module'
import { AppService as RickService } from '../../rick/src/app/app.service'
import { Environment as RickEnvironment } from '../../rick/src/environments/environment.dev'
import { Environment as GandalfEnvironment } from '../../gandalf/src/environments/environment.dev'

describe('Princess System Test', () => {
  let app: INestApplication
  let fluffyApp: INestApplication
  let gandalfApp: INestApplication
  let rickApp: INestApplication
  let gandalfAuthService
  let device

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

    const gandalfModule: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [GandalfEnvironment] }),

        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [AccountEntity],
        }),

        TypeOrmModule.forFeature([AccountEntity]),
        GandalfModule,
        AuthModule,
        GandalfAccountModule,
        // HttpModule, //
      ],
    }).compile()

    gandalfApp = gandalfModule.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    await gandalfApp.listen(3333)

    gandalfAuthService = gandalfApp.get<AuthService>(AuthService)

    const rickModule: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [RickEnvironment] }),
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            RickAccountEntity,
            WalletEntity, //
            AddressEntity,
            HistoryEntity,
          ],
        }),
        TypeOrmModule.forFeature([
          RickAccountEntity,
          WalletEntity, //
          AddressEntity,
          HistoryEntity,
        ]),
        RickModule,
        PortfolioModule,
        WalletModule,
        RickAccountModule,
        HttpModule,
      ],
    }).compile()

    rickApp = rickModule.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    await rickApp.listen(3334)
  }, 20000)

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

    it('Welcome message in Gandalf', async () => {
      const data = await axios.get('http://localhost:3333/')
      expect(data.status).toEqual(200)
      expect(await data.data).toEqual(GandalfService.welcomeMessage)
    })

    it('Welcome message in Rick', async () => {
      const data = await axios.get('http://localhost:3334/')
      expect(data.status).toEqual(200)
      expect(await data.data).toEqual(RickService.welcomeMessage)
    })
  })

  describe('Onboarding Controller', () => {
    it('should create device', async () => {
      const data = await axios.post('http://localhost:3000/onboarding/device')
      device = data.data
      expect(data.status).toEqual(201)
      expect(await data.data.secret).toBeDefined()
    })

    it('should login', async () => {
      jest.spyOn(gandalfAuthService, 'authorize').mockImplementation(() => ({
        name: 'test',
        email: 'test@gmail.com',
      }))
      const data = await axios.post('http://localhost:3000/onboarding/login', {
        type: 'google',
        id_token:
          'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk2OTcxODA4Nzk2ODI5YTk3MmU3OWE5ZDFhOWZmZjExY2Q2MWIxZTMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxNDE5MTAxNzU3NjMtODZhYTRmbnJmbXFiMGdubGYwYnU1Z2trOTIzamxhaTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxNDE5MTAxNzU3NjMtM21wZHBuNGRqN2g1MmZ1NXIxajhvcmdybWU2bXJ2OWQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDc3MzY5OTA5MjI2NjM5ODk2NjMiLCJoZCI6Im5ncmF2ZS5pbyIsImVtYWlsIjoiY2FpcXVlLmNydXpAbmdyYXZlLmlvIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJUZkRlMlBVSGE2RGxEcmJaQW1IcWRRIiwibm9uY2UiOiJHVmdYU2xoSFFrOTkxMGNacmNDWkZPakFsTUFNNnNheWptbUFLOTVrM1FJIiwibmFtZSI6IkNhaXF1ZSBDcnV6IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FHTm15eFp6WVBEQnpRWEE4WmlCeVNBSVhpdXBTTF9iNkQtS2FzSFVkV1VKPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkNhaXF1ZSIsImZhbWlseV9uYW1lIjoiQ3J1eiIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjgyMDA5MTg0LCJleHAiOjE2ODIwMTI3ODR9.hYRJYGTULT-9JheUudDmCWTDPIlCYlBhB7gSeDexbFWdH5mIpAdCjTpi_WNfXYglYPaQvLJcZ-C31sM2-KFdiGNuZ-vJ0VVzmyrIDqnEEtplKnUxbChVAd4YnfQSFeyJoRf8HRi2d5Q2BiqtF0z2IlY_nuuLIgGPDe9umkQ9kekGbZD5fgA_zuanOd068V2xtf24WNZadbb9cYk0UQd96x98luCARaA9s-JtUQT4ftL-VtJKF1g8kcF7TjLwhKSS59szgcW27ES8652rF5Rc8_SnYDjdr6-k5QE9JSFN2QdyDHatCEYBM7ERNDf-X5bacoAFTwupccQEa5fi3cKpcw',
        device_id: device.device_id,
        otp: 'string',
        server_proposed_shard: 'string',
        own_proposed_shard: 'string',
        passcode_key: 'string',
        recovery_key: 'string',
      })
      console.log({ data })
      expect(data.status).toEqual(200)
      expect(await data.data.secret).toBeDefined()
    })
  })
})
