import { TypeOrmModule } from '@nestjs/typeorm'
import { Test, TestingModule } from '@nestjs/testing'
import { AccountService } from './account.service'
import { AccountEntity } from './account.entity'

describe('AccountService', () => {
  let service: AccountService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
        }),
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
