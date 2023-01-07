import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from '../src/app/app.controller'
import { AppService } from '../src/app/app.service'

describe('AnonGateway', () => {
  let app: INestApplication

  beforeAll(async () => {
    // Initialize and start the server
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile()

    app = module.createNestApplication()
    await app.listen(3000)
  })

  describe('Welcome Message', () => {
    it('', async () => {
      expect.assertions(2)
      const data = await fetch('http://localhost:3000/')
      expect(data.status).toEqual(200)
      expect(await data.text()).toEqual(AppService.welcomeMessage)
    })
  })
})
