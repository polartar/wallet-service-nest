import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletEntity } from './wallet.entity'
import { WalletService } from './wallet.service'

@Module({
  imports: [TypeOrmModule.forFeature([WalletEntity])],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
