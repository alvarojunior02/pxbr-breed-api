import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderStatusHistory } from '../order-status-history/entities/order-status-history.entity';
import { Order } from '../orders/entities/order.entity';
import { OwnedHa } from '../owned-has/entities/owned-ha.entity';
import { OwnedPokemon } from '../owned-pokemons/entities/owned-pokemon.entity';
import { Player } from '../players/entities/player.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { Settings } from '../settings/entities/settings.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Player,
            Order,
            Transaction,
            OrderStatusHistory,
            OwnedPokemon,
            OwnedHa,
            Settings,
        ]),
    ],
    controllers: [BackupController],
    providers: [BackupService],
})
export class BackupModule {}
