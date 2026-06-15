import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderPokemon } from '../orders/entities/order-pokemon.entity';
import { Order } from '../orders/entities/order.entity';
import { Player } from '../players/entities/player.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderPokemon, Player])],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule {}
