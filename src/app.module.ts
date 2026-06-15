import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './database/database.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PlayersModule } from './players/players.module';
import { OrdersModule } from './orders/orders.module';
import { TransactionsModule } from './transactions/transactions.module';
import { OrderStatusHistoryModule } from './order-status-history/order-status-history.module';
import { OwnedPokemonsModule } from './owned-pokemons/owned-pokemons.module';
import { OwnedHasModule } from './owned-has/owned-has.module';
import { BackupModule } from './backup/backup.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 60,
            },
        ]),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: getDatabaseConfig,
        }),
        UsersModule,
        AuthModule,
        PlayersModule,
        OrdersModule,
        TransactionsModule,
        OrderStatusHistoryModule,
        OwnedPokemonsModule,
        OwnedHasModule,
        BackupModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
