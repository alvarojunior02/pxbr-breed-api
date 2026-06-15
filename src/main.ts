import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

    app.enableCors({
        origin: configService.get<string>('FRONTEND_ORIGIN'),
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const port = configService.get<number>('APP_PORT') || 3001;

    await app.listen(port);
}

bootstrap();
