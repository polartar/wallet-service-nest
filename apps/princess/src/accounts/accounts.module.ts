import { Module } from '@nestjs/common'
import { AccountsController } from './accounts.controller'
import { HttpModule } from '@nestjs/axios'
import { AccountsService } from './accounts.service'
import { AuthService } from '../auth/auth.service'
import { BootstrapService } from '../bootstrap/bootstrap.service'

@Module({
  imports: [
    HttpModule, //
  ],
  controllers: [AccountsController],
  providers: [AccountsService, AuthService, BootstrapService],
})
export class AccountsModule {}
