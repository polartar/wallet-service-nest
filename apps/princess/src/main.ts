/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app/app.module'

async function bootstrap() {
  /* TODO: Switch to fastify by defauly
    https://docs.nestjs.com/techniques/performance#installation
  */
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  // const app.setGlobalPrefix(restPrefix)
  // TODO: Check NestJS config
  const port = process.env.PORT || 3333
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}/`)
}

try {
  bootstrap()
} catch (e) {
  console.error('Error starting the app', e)
}
