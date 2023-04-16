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
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

import { AppModule } from './app/app.module'
import * as Sentry from '@sentry/node'

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
  const port = process.env.PORT || 3000
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      stopAtFirstError: true,
      always: true,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('Princess API')
    .setDescription('The Princess API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: parseInt(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.5,
    environment: process.env.SENTRY_ENVIRONMENT || 'dev',
  })

  const listen_host = process.env.DOCKER ? '0.0.0.0' : '127.0.0.1'
  await app.listen(port, listen_host)
  Logger.log(`🚀 Application is running on: ${await app.getUrl()}/`)
}

bootstrap()
