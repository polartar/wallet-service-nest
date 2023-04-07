import { Module } from '@nestjs/common'
import { AccountsController } from './accounts.controller'
import { HttpModule } from '@nestjs/axios'
import { AccountsService } from './accounts.service'

@Module({
  imports: [
    HttpModule, //
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
