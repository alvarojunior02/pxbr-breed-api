import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from '../orders/orders.module';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrderStatusHistoryController } from './order-status-history.controller';
import { OrderStatusHistoryService } from './order-status-history.service';

@Module({
    imports: [TypeOrmModule.forFeature([OrderStatusHistory]), OrdersModule],
    controllers: [OrderStatusHistoryController],
    providers: [OrderStatusHistoryService],
    exports: [OrderStatusHistoryService],
})
export class OrderStatusHistoryModule {}
