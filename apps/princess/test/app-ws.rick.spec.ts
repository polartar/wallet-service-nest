import { AppModule } from '../src/app/app.module'
import { MarketModule } from './../src/market/market.module'
import { Environment } from '../src/environments/environment.dev'
import { ConfigModule } from '@nestjs/config'
import { RickGateway } from '../src/gateways/rick.gateway'
import { PortfolioModule } from '../src/portfolio/portfolio.module'
import { HttpModule } from '@nestjs/axios'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { RickModule } from '../src/gateways/rick.module'
import { io, Socket } from 'socket.io-client'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { PortfolioService } from '../src/portfolio/portfolio.service'
import { Logger } from '@nestjs/common'
import { MarketService } from '../src/market/market.service'

const runPrincessPortfolioModule = async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ load: [Environment] }),
      AppModule,
      RickModule, //
      HttpModule,
      PortfolioModule,
      MarketModule,
    ],
    providers: [
      RickGateway, //
      PortfolioService,
      MarketService,
    ],
  }).compile()

  return module.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter({
      logger: true,
    }),
  )
}

// const runPortfolioModule = async () => {
//   const module: TestingModule = await Test.createTestingModule({
//     imports: [
//       ConfigModule.forRoot({ load: [Environment] }),
//       TypeOrmModule.forRoot({
//         type: 'better-sqlite3',
//         database: ':memory:',
//         dropSchema: true,
//         synchronize: true,
//         entities: [
//           WalletEntity, //
//           AccountEntity,
//         ],
//       }),
//       TypeOrmModule.forFeature([
//         WalletEntity, //
//         AccountEntity,
//       ]),

//       HttpModule,
//       WalletModule,
//       AccountModule,
//     ],
//     controllers: [WalletController],
//     providers: [PortfolioService],
//   }).compile()

//   return module.createNestApplication<NestFastifyApplication>(
//     new FastifyAdapter({
//       logger: true,
//     }),
//   )
// }
describe('RickGateway', () => {
  let princessPortfoloApp: INestApplication
  // let portfoloApp: INestApplication
  let socket: Socket

  beforeAll(async () => {
    // Initialize and start the server
    princessPortfoloApp = await runPrincessPortfolioModule()

    princessPortfoloApp.useLogger(new Logger())
    await princessPortfoloApp.listen(3331)

    // portfoloApp = await runPortfolioModule()
    // await portfoloApp.listen(3333)
    // Connect the client
    socket = io('http://localhost:3331/')
  })

  afterAll(async () => {
    socket.disconnect()
  })

  describe('Socket.io Conenction', () => {
    it('Connected', (done) => {
      socket.on('connect', () => {
        done()
      })
    })

    it('Get all wallet history', async () => {
      const accountId = 1
      const channelId = `portfolio_history`
      const data = await new Promise((resolve) => {
        socket.on(channelId, (data) => {
          Logger.log('history received', data)

          resolve(data)
        })
        socket.emit('get_portfolio_history', { accountId })
      })
      expect(data).toBeDefined()
    })

    it('Get wallet history for 1D', async () => {
      const accountId = 1
      const channelId = `portfolio_history`
      const data = await new Promise((resolve) => {
        socket.on(channelId, (data) => {
          Logger.log('1D history received', data)

          resolve(data)
        })
        socket.emit('get_portfolio_history', {
          accountId,
          period: ['1D'],
        })
      })
      expect(data).toBeDefined()
    })
  })
})
