import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayersService } from '../players/players.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrdersQueryDto } from './dto/find-orders-query.dto';
import { OrderPokemonDto } from './dto/order-pokemon.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderPokemon } from './entities/order-pokemon.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,
        private readonly playersService: PlayersService,
    ) {}

    async findAll(query: FindOrdersQueryDto) {
        const orders = await this.ordersRepository.find({
            relations: {
                player: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });

        return orders.filter((order) => {
            const matchesPlayer = !query.playerId || order.playerId === query.playerId;
            const matchesStatus =
                !query.status || order.pokemons?.some((pokemon) => pokemon.status === query.status);
            const matchesArchived =
                query.archived === undefined || order.archived === (query.archived === 'true');
            const matchesPayment = this.matchesPaymentStatus(order, query.paymentStatus);
            const matchesSearch = this.matchesSearch(order, query.search);

            return (
                matchesPlayer &&
                matchesStatus &&
                matchesArchived &&
                matchesPayment &&
                matchesSearch
            );
        });
    }

    async findOne(id: string) {
        const order = await this.ordersRepository.findOne({
            where: {
                id,
            },
            relations: {
                player: true,
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found.');
        }

        return order;
    }

    async create(createOrderDto: CreateOrderDto) {
        await this.playersService.findOne(createOrderDto.playerId);

        const order = this.ordersRepository.create({
            ...this.getOrderPayload(createOrderDto),
            pokemons: this.createOrderPokemons(createOrderDto.pokemons),
        });

        return this.ordersRepository.save(order);
    }

    async update(id: string, updateOrderDto: UpdateOrderDto) {
        const order = await this.findOne(id);

        if (updateOrderDto.playerId && updateOrderDto.playerId !== order.playerId) {
            await this.playersService.findOne(updateOrderDto.playerId);
        }

        Object.assign(order, this.getOrderPayload(updateOrderDto, order));

        if (updateOrderDto.pokemons) {
            order.pokemons = this.createOrderPokemons(updateOrderDto.pokemons);
        }

        return this.ordersRepository.save(order);
    }

    async remove(id: string) {
        const order = await this.findOne(id);

        await this.ordersRepository.remove(order);

        return {
            deleted: true,
        };
    }

    private createOrderPokemons(pokemons: OrderPokemonDto[]) {
        return pokemons.map((pokemon) => {
            const orderPokemon = new OrderPokemon();

            Object.assign(orderPokemon, {
                pokemonId: pokemon.pokemonId,
                pokemonName: pokemon.pokemonName,
                sprite: pokemon.sprite || null,
                breedPokemonId: pokemon.breedPokemonId || null,
                breedPokemonName: pokemon.breedPokemonName || null,
                nature: pokemon.nature,
                abilityName: pokemon.abilityName || null,
                abilityIsHa: pokemon.abilityIsHa,
                regionalForm: pokemon.regionalForm || null,
                regionalFormLabel: pokemon.regionalFormLabel || null,
                regionalFormDisplayName: pokemon.regionalFormDisplayName || null,
                value: pokemon.value,
                breedable: pokemon.breedable,
                status: pokemon.status,
            });

            return orderPokemon;
        });
    }

    private getOrderPayload(orderDto: UpdateOrderDto, currentOrder?: Order) {
        return {
            playerId: orderDto.playerId ?? currentOrder?.playerId,
            subtotal: orderDto.subtotal ?? currentOrder?.subtotal ?? 0,
            discount: orderDto.discount ?? currentOrder?.discount ?? 0,
            total: orderDto.total ?? currentOrder?.total ?? 0,
            paidAmount: orderDto.paidAmount ?? currentOrder?.paidAmount ?? 0,
            paid:
                orderDto.paid ??
                this.isOrderPaid(
                    orderDto.paidAmount ?? currentOrder?.paidAmount ?? 0,
                    orderDto.total ?? currentOrder?.total ?? 0,
                ),
            needsFemale: orderDto.needsFemale ?? currentOrder?.needsFemale ?? false,
            observations: orderDto.observations ?? currentOrder?.observations ?? null,
            archived: orderDto.archived ?? currentOrder?.archived ?? false,
        };
    }

    private isOrderPaid(paidAmount: number, total: number) {
        return total > 0 && paidAmount >= total;
    }

    private matchesPaymentStatus(order: Order, paymentStatus?: 'paid' | 'partial' | 'pending') {
        if (!paymentStatus) {
            return true;
        }

        const paidAmount = order.paidAmount || 0;
        const total = order.total || 0;

        if (paymentStatus === 'paid') {
            return paidAmount >= total;
        }

        if (paymentStatus === 'partial') {
            return paidAmount > 0 && paidAmount < total;
        }

        return paidAmount === 0;
    }

    private matchesSearch(order: Order, search?: string) {
        if (!search) {
            return true;
        }

        const normalizedSearch = search.trim().toLowerCase();
        const searchableText = [
            order.id,
            order.player?.nick,
            order.observations,
            ...(order.pokemons || []).flatMap((pokemon) => [
                pokemon.pokemonName,
                pokemon.breedPokemonName,
                pokemon.abilityName,
                pokemon.nature,
                pokemon.regionalFormLabel,
                pokemon.status,
            ]),
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableText.includes(normalizedSearch);
    }
}
