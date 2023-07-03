import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { AccountsService } from '../accounts/accounts.service'
import { JwtService } from '@nestjs/jwt'
import { CoinService } from '../coin/coin.service'
import { TransactionService } from '../transaction/transaction.service'
import { BootstrapService } from '../bootstrap/bootstrap.service'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      providers: [
        AuthService,
        AccountsService,
        JwtService,
        CoinService,
        TransactionService,
        BootstrapService,
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
