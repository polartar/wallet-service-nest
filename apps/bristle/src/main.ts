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
import { ProfilingIntegration } from '@sentry/profiling-node'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
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
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate:
      parseInt(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 1.0,
    environment: process.env.SENTRY_ENVIRONMENT || 'dev',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Automatically instrument Node.js libraries and frameworks
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
      new ProfilingIntegration(),
    ],
  })
  const port = process.env.PORT || 3333
  const listen_host = process.env.DOCKER ? '0.0.0.0' : '127.0.0.1'
  await app.listen(port, listen_host)
  Logger.log(`🚀 Application is running on: http://${listen_host}:${port}/`)
}

bootstrap()
