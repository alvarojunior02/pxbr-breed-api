import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

function getPostgresSslConfig(configService: ConfigService) {
    const databaseSsl = configService.get<string>('DATABASE_SSL') === 'true';

    if (!databaseSsl) {
        return false;
    }

    return {
        rejectUnauthorized: false,
    };
}

export function getDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions {
    const databaseType = configService.get<string>('DATABASE_TYPE') || 'better-sqlite3';

    if (databaseType === 'postgres') {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        const baseConfig: TypeOrmModuleOptions = {
            type: 'postgres',
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            migrations: [__dirname + '/migrations/*{.ts,.js}'],
            synchronize: false,
            migrationsRun: configService.get<string>('DATABASE_MIGRATIONS_RUN') === 'true',
            ssl: getPostgresSslConfig(configService),
            extra: {
                options: `-c timezone=${configService.get<string>('DATABASE_TIMEZONE') || 'America/Cuiaba'}`,
            },
        };

        if (databaseUrl) {
            return {
                ...baseConfig,
                url: databaseUrl,
            };
        }

        return {
            ...baseConfig,
            host: configService.get<string>('DATABASE_HOST') || 'localhost',
            port: Number(configService.get<string>('DATABASE_PORT') || 5432),
            username: configService.get<string>('DATABASE_USERNAME') || 'postgres',
            password: configService.get<string>('DATABASE_PASSWORD') || 'postgres',
            database: configService.get<string>('DATABASE_NAME') || 'pxbr_breed',
        };
    }

    return {
        type: 'better-sqlite3',
        database: configService.get<string>('DATABASE_NAME') || 'pxbr-breed.sqlite',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('APP_ENV') !== 'production',
    };
}
