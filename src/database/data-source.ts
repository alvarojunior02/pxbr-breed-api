import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

function getPostgresSslConfig() {
    if (process.env.DATABASE_SSL !== 'true') {
        return false;
    }

    return {
        rejectUnauthorized: false,
    };
}

const databaseType = process.env.DATABASE_TYPE || 'postgres';

const postgresBaseConfig: DataSourceOptions = {
    type: 'postgres',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
    ssl: getPostgresSslConfig(),
    extra: {
        options: `-c timezone=${process.env.DATABASE_TIMEZONE || 'America/Cuiaba'}`,
    },
};

const postgresConfig: DataSourceOptions = process.env.DATABASE_URL
    ? {
          ...postgresBaseConfig,
          url: process.env.DATABASE_URL,
      }
    : {
          ...postgresBaseConfig,
          host: process.env.DATABASE_HOST || 'localhost',
          port: Number(process.env.DATABASE_PORT || 5432),
          username: process.env.DATABASE_USERNAME || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'postgres',
          database: process.env.DATABASE_NAME || 'pxbr_breed',
      };

const sqliteConfig: DataSourceOptions = {
    type: 'better-sqlite3',
    database: process.env.DATABASE_NAME || 'pxbr-breed.sqlite',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
};

export default new DataSource(
    databaseType === 'postgres' ? postgresConfig : sqliteConfig,
);
