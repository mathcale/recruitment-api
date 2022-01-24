import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { fastifyHelmet } from 'fastify-helmet';
import fastifyCookie from 'fastify-cookie';
import fastifyCsrf from 'fastify-csrf';

import { AppModule } from './app.module';
import { TransformInterceptor } from './transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.register(fastifyHelmet);
  app.register(fastifyCookie, { secret: process.env.COOKIE_SECRET });
  await app.register(fastifyCsrf, { cookieOpts: { signed: true } });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(process.env.PORT || 8080, process.env.HOST || '0.0.0.0');
}

bootstrap();
