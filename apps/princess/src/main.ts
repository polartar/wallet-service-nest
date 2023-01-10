/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

import { AppModule } from './app/app.module'

async function bootstrap() {
  /* TODO: Switch to fastify by defauly
    https://docs.nestjs.com/techniques/performance#installation
  */
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
  )
  // TODO: Check NestJS config
  const port = process.env.PORT || 3333
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      stopAtFirstError: true,
      always: true,
    }),
  )
  await app.listen(port)
  Logger.log(`🚀 Application is running on: ${await app.getUrl()}/`)
}

bootstrap()
