process.env.TZ = process.env.TZ || 'America/Cuiaba';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PXBR Breed API')
    .setDescription('REST API for PXBR Breed management system.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('refreshToken')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, swaggerDocument);

  app.use(helmet());

  app.use(cookieParser());

  const corsOrigins = [
    configService.get<string>('FRONTEND_URL'),
    ...(configService
      .get<string>('CORS_ORIGIN')
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) || []),
    'http://127.0.0.1:5500',
    'http://localhost:5500',
  ].filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  });

  app.use((request, response, next) => {
    if (request.method === 'OPTIONS') {
      response.sendStatus(204);
      return;
    }

    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port =
    configService.get<number>('PORT') ||
    configService.get<number>('APP_PORT') ||
    3001;

  await app.listen(port);
}

bootstrap();
