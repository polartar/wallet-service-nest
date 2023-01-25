import { TypeOrmModule } from '@nestjs/typeorm'
import { Test, TestingModule } from '@nestjs/testing'
import { AccountService } from './account.service'
import { AccountEntity } from './account.entity'

const createMock = jest.fn((dto: any) => {
  return dto
})

const saveMock = jest.fn((dto: any) => {
  return dto
})

const MockRepository = jest.fn().mockImplementation(() => {
  return {
    create: createMock,
    save: saveMock,
  }
})
const mockRepository = new MockRepository()

describe('AccountService', () => {
  let service: AccountService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5431,
          username: 'myusername',
          password: 'mypassword',
          database: 'gandalf',

          // TODO: Maybe disable in production?
          autoLoadEntities: true,
          synchronize: true,
        }),

        TypeOrmModule.forFeature([AccountEntity]),
      ],
      providers: [AccountService],
    }).compile()

    service = module.get<AccountService>(AccountService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should lookUp return empty', async () => {
    const account = await service.lookup({ email: 'test@gmail.com' })
    expect(account).toBeNull()
  })

  it('should create new account', async () => {
    await service.create({ email: 'test@gmail.com', name: 'test' })
    const account = await service.lookup({ email: 'test@gmail.com' })
    expect(account.email).toBe('test@gmail.com')
  })
})
