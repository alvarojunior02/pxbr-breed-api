import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const databaseType = process.env.DATABASE_TYPE || 'postgres';

const postgresConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 5432),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'pxbr_breed',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
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
