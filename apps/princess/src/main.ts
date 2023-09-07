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
import { ProfilingIntegration } from '@sentry/profiling-node'
import * as SentryTracing from '@sentry/tracing'

async function bootstrap() {
  /* TODO: Switch to fastify by defauly
    https://docs.nestjs.com/techniques/performance#installation
  */
  SentryTracing && true // This is to ensure bundler won't optimise the sentry/tracing import (https://github.com/getsentry/sentry-javascript/issues/4731#issuecomment-1098530656)
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
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.5,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate:
      parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 1.0,
    environment: process.env.SENTRY_ENVIRONMENT || 'dev',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Automatically instrument Node.js libraries and frameworks
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
      new ProfilingIntegration(),
    ],
  })

  const transaction = Sentry.startTransaction({
    op: 'test_txn',
    name: 'Test transaction to check if sentry works',
  })

  setTimeout(() => {
    try {
      // @ts-expect-error we want to raise a runtime error here
      foo()
    } catch (e) {
      Logger.log(
        `sentry: capturing error. DSN: ${process.env.SENTRY_DSN}, e: ${e}`,
      )
      Sentry.captureException(e)
    } finally {
      transaction.finish()
    }
  }, 99)

  const listen_host = process.env.DOCKER ? '0.0.0.0' : '127.0.0.1'
  await app.listen(port, listen_host)
  Logger.log(`🚀 Application is running on: ${await app.getUrl()}/`)
}

bootstrap()
