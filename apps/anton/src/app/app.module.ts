import { Module } from '@nestjs/common'
import { CryptoController } from '../crypto/crypto.controller'
import { CryptoService } from '../crypto/crypto.service'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  controllers: [
    AppController, //
    CryptoController,
  ],
  providers: [
    AppService, //
    CryptoService,
  ],
})
export class AppModule {}
