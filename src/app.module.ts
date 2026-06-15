import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (
                configService: ConfigService,
            ): TypeOrmModuleOptions => ({
                type: 'better-sqlite3',
                database:
                    configService.get<string>('DATABASE_NAME') || 'pxbr-breed.sqlite',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize:
                    configService.get<string>('APP_ENV') !== 'production',
            }),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
