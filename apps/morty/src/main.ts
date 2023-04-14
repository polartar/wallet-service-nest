/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

import { AppModule } from './app/app.module'
import * as Sentry from '@sentry/node'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )
  const globalPrefix = 'api'
  app.setGlobalPrefix(globalPrefix)
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: parseInt(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.5,
    environment: process.env.SENTRY_ENVIRONMENT || 'dev',
  })
  const port = process.env.PORT || 3333
  const listen_host = process.env.DOCKER ? '0.0.0.0' : '127.0.0.1'
  await app.listen(port, listen_host)
  Logger.log(
    `🚀 Application is running on: http://${listen_host}:${port}/${globalPrefix}`,
  )
}

bootstrap()
