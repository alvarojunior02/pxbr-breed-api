import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderPokemon } from '../orders/entities/order-pokemon.entity';
import { Order } from '../orders/entities/order.entity';
import { Player } from '../players/entities/player.entity';
import { FindReportsQueryDto } from './dto/find-reports-query.dto';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,
        @InjectRepository(OrderPokemon)
        private readonly orderPokemonsRepository: Repository<OrderPokemon>,
        @InjectRepository(Player)
        private readonly playersRepository: Repository<Player>,
    ) {}

    async getTopSellingPokemons(query: FindReportsQueryDto = {}) {
        const orderPokemons = await this.getOrderPokemonsByPeriod(query);

        const groupedPokemons = new Map<
            string,
            {
                pokemonId: number;
                pokemonName: string;
                quantity: number;
                totalValue: number;
            }
        >();

        for (const pokemon of orderPokemons) {
            const key = `${pokemon.pokemonId}-${pokemon.pokemonName}`;
            const current = groupedPokemons.get(key) || {
                pokemonId: pokemon.pokemonId,
                pokemonName: pokemon.pokemonName,
                quantity: 0,
                totalValue: 0,
            };

            current.quantity += 1;
            current.totalValue += pokemon.value || 0;

            groupedPokemons.set(key, current);
        }

        return Array.from(groupedPokemons.values()).sort(
            (a, b) => b.quantity - a.quantity || b.totalValue - a.totalValue,
        );
    }

    async getTopSellingHas(query: FindReportsQueryDto = {}) {
        const orderPokemons = await this.getOrderPokemonsByPeriod(query);

        const groupedHas = new Map<
            string,
            {
                abilityName: string;
                quantity: number;
                totalValue: number;
            }
        >();

        for (const pokemon of orderPokemons) {
            if (!pokemon.abilityIsHa) {
                continue;
            }

            const current = groupedHas.get(pokemon.abilityName) || {
                abilityName: pokemon.abilityName,
                quantity: 0,
                totalValue: 0,
            };

            current.quantity += 1;
            current.totalValue += pokemon.value || 0;

            groupedHas.set(pokemon.abilityName, current);
        }

        return Array.from(groupedHas.values()).sort(
            (a, b) => b.quantity - a.quantity || b.totalValue - a.totalValue,
        );
    }

    async getTopBuyingPlayers(query: FindReportsQueryDto = {}) {
        const orders = await this.getOrdersByPeriod(query);

        const groupedPlayers = new Map<
            string,
            {
                playerId: string;
                nick: string;
                totalOrders: number;
                totalValue: number;
                paidAmount: number;
            }
        >();

        for (const order of orders) {
            const current = groupedPlayers.get(order.playerId) || {
                playerId: order.playerId,
                nick: order.player?.nick || 'Unknown',
                totalOrders: 0,
                totalValue: 0,
                paidAmount: 0,
            };

            current.totalOrders += 1;
            current.totalValue += order.total || 0;
            current.paidAmount += order.paidAmount || 0;

            groupedPlayers.set(order.playerId, current);
        }

        return Array.from(groupedPlayers.values()).sort(
            (a, b) =>
                b.totalValue - a.totalValue || b.totalOrders - a.totalOrders,
        );
    }

    async getPlayersDebt(query: FindReportsQueryDto = {}) {
        const orders = await this.getOrdersByPeriod(query);

        const groupedPlayers = new Map<
            string,
            {
                playerId: string;
                nick: string;
                debtAmount: number;
                openOrders: number;
            }
        >();

        for (const order of orders) {
            const debt = Math.max(
                (order.total || 0) - (order.paidAmount || 0),
                0,
            );

            if (debt <= 0) {
                continue;
            }

            const current = groupedPlayers.get(order.playerId) || {
                playerId: order.playerId,
                nick: order.player?.nick || 'Unknown',
                debtAmount: 0,
                openOrders: 0,
            };

            current.debtAmount += debt;
            current.openOrders += 1;

            groupedPlayers.set(order.playerId, current);
        }

        return Array.from(groupedPlayers.values()).sort(
            (a, b) =>
                b.debtAmount - a.debtAmount || b.openOrders - a.openOrders,
        );
    }

    async getDashboardSummary(query: FindReportsQueryDto = {}) {
        const [players, orders, orderPokemons] = await Promise.all([
            this.playersRepository.find(),
            this.getOrdersByPeriod(query),
            this.getOrderPokemonsByPeriod(query),
        ]);

        const totalRevenue = orders.reduce(
            (total, order) => total + (order.total || 0),
            0,
        );

        const paidRevenue = orders.reduce(
            (total, order) => total + (order.paidAmount || 0),
            0,
        );

        const pendingRevenue = orders.reduce(
            (total, order) =>
                total +
                Math.max((order.total || 0) - (order.paidAmount || 0), 0),
            0,
        );

        const activeOrders = orders.filter((order) => !order.archived).length;
        const archivedOrders = orders.filter((order) => order.archived).length;
        const completedPokemons = orderPokemons.filter(
            (pokemon) => pokemon.status?.toLowerCase() === 'pronto',
        ).length;

        return {
            totalPlayers: players.length,
            totalOrders: orders.length,
            activeOrders,
            archivedOrders,
            totalPokemons: orderPokemons.length,
            completedPokemons,
            totalRevenue,
            paidRevenue,
            pendingRevenue,
        };
    }

    private async getOrdersByPeriod(query: FindReportsQueryDto) {
        const orders = await this.ordersRepository.find({
            relations: {
                player: true,
            },
        });

        return orders.filter((order) =>
            this.isWithinPeriod(order.createdAt, query),
        );
    }

    private async getOrderPokemonsByPeriod(query: FindReportsQueryDto) {
        const orderPokemons = await this.orderPokemonsRepository.find({
            relations: {
                order: true,
            },
        });

        return orderPokemons.filter((pokemon) =>
            this.isWithinPeriod(pokemon.order?.createdAt, query),
        );
    }

    private isWithinPeriod(
        date: Date | string | undefined,
        query: FindReportsQueryDto,
    ) {
        if (!query.startDate && !query.endDate) {
            return true;
        }

        if (!date) {
            return false;
        }

        const currentDate = new Date(date);
        const startDate = query.startDate ? new Date(query.startDate) : null;
        const endDate = query.endDate ? this.getEndOfDay(query.endDate) : null;

        if (startDate && currentDate < startDate) {
            return false;
        }

        if (endDate && currentDate > endDate) {
            return false;
        }

        return true;
    }

    private getEndOfDay(date: string) {
        const endDate = new Date(date);

        endDate.setHours(23, 59, 59, 999);

        return endDate;
    }
}
