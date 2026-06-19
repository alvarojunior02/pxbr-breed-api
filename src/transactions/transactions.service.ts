import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from '../orders/orders.service';
import { PlayersService } from '../players/players.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FindTransactionsQueryDto } from './dto/find-transactions-query.dto';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionsRepository: Repository<Transaction>,
        private readonly playersService: PlayersService,
        private readonly ordersService: OrdersService,
    ) {}

    async findAll(query: FindTransactionsQueryDto) {
        const transactions = await this.transactionsRepository.find({
            relations: {
                player: true,
                order: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });

        return transactions.filter((transaction) => {
            const matchesPlayer = !query.playerId || transaction.playerId === query.playerId;
            const matchesOrder = !query.orderId || transaction.orderId === query.orderId;
            const matchesType = !query.type || transaction.type === query.type;
            const matchesSearch = this.matchesSearch(transaction, query.search);

            return matchesPlayer && matchesOrder && matchesType && matchesSearch;
        });
    }

    async findOne(id: string) {
        const transaction = await this.transactionsRepository.findOne({
            where: {
                id,
            },
            relations: {
                player: true,
                order: true,
            },
        });

        if (!transaction) {
            throw new NotFoundException('Transaction not found.');
        }

        return transaction;
    }

    async create(createTransactionDto: CreateTransactionDto) {
        const player = await this.playersService.findOne(createTransactionDto.playerId);
        const order = await this.ordersService.findOne(createTransactionDto.orderId);

        if (order.playerId !== player.id) {
            throw new BadRequestException('Order does not belong to selected player.');
        }

        const currentPaidAmount = order.paidAmount || 0;
        const nextPaidAmount = currentPaidAmount + createTransactionDto.amount;

        if (nextPaidAmount > order.total) {
            throw new BadRequestException('Transaction amount exceeds order remaining amount.');
        }

        const transaction = this.transactionsRepository.create({
            playerId: player.id,
            orderId: order.id,
            amount: createTransactionDto.amount,
            type: createTransactionDto.type || 'ORDER_PAYMENT',
            notes: createTransactionDto.notes || null,
        });

        const savedTransaction = await this.transactionsRepository.save(transaction);

        await this.ordersService.update(order.id, {
            paidAmount: nextPaidAmount,
            paid: nextPaidAmount >= order.total,
        });

        return this.findOne(savedTransaction.id);
    }

    async remove(id: string) {
        const transaction = await this.findOne(id);

        await this.transactionsRepository.remove(transaction);

        const order = await this.ordersService.findOne(transaction.orderId);

        const nextPaidAmount = Math.max((order.paidAmount || 0) - transaction.amount, 0);

        await this.ordersService.update(order.id, {
            paidAmount: nextPaidAmount,
            paid: nextPaidAmount >= order.total,
        });

        return {
            deleted: true,
        };
    }

    private matchesSearch(transaction: Transaction, search?: string) {
        if (!search) {
            return true;
        }

        const normalizedSearch = search.trim().toLowerCase();

        const searchableText = [
            transaction.id,
            transaction.type,
            transaction.notes,
            transaction.player?.nick,
            transaction.order?.id,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableText.includes(normalizedSearch);
    }
}
