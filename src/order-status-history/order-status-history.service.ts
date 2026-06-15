import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderStatusHistoryDto } from './dto/create-order-status-history.dto';
import { OrderStatusHistory } from './entities/order-status-history.entity';

@Injectable()
export class OrderStatusHistoryService {
    constructor(
        @InjectRepository(OrderStatusHistory)
        private readonly orderStatusHistoryRepository: Repository<OrderStatusHistory>,
        private readonly ordersService: OrdersService,
    ) {}

    async findByOrder(orderId: string) {
        await this.ordersService.findOne(orderId);

        return this.orderStatusHistoryRepository.find({
            where: {
                orderId,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async create(
        orderId: string,
        createOrderStatusHistoryDto: CreateOrderStatusHistoryDto,
    ) {
        await this.ordersService.findOne(orderId);

        const history = this.orderStatusHistoryRepository.create({
            orderId,
            orderPokemonId: createOrderStatusHistoryDto.orderPokemonId || null,
            pokemonDexId: createOrderStatusHistoryDto.pokemonDexId || null,
            pokemonName: createOrderStatusHistoryDto.pokemonName || null,
            oldStatus: createOrderStatusHistoryDto.oldStatus || null,
            newStatus: createOrderStatusHistoryDto.newStatus,
            notes: createOrderStatusHistoryDto.notes || null,
        });

        return this.orderStatusHistoryRepository.save(history);
    }

    async remove(id: string) {
        const history = await this.orderStatusHistoryRepository.findOne({
            where: {
                id,
            },
        });

        if (!history) {
            throw new NotFoundException('Order status history not found.');
        }

        await this.orderStatusHistoryRepository.remove(history);

        return {
            deleted: true,
        };
    }
}
