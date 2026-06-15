import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderPokemon } from '../orders/entities/order-pokemon.entity';
import { Order } from '../orders/entities/order.entity';
import { Player } from '../players/entities/player.entity';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
    let service: ReportsService;

    const ordersRepositoryMock = {
        find: jest.fn(),
    };

    const orderPokemonsRepositoryMock = {
        find: jest.fn(),
    };

    const playersRepositoryMock = {
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: ordersRepositoryMock,
                },
                {
                    provide: getRepositoryToken(OrderPokemon),
                    useValue: orderPokemonsRepositoryMock,
                },
                {
                    provide: getRepositoryToken(Player),
                    useValue: playersRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<ReportsService>(ReportsService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should get top selling Pokémons report', async () => {
        orderPokemonsRepositoryMock.find.mockResolvedValue([
            {
                pokemonId: 636,
                pokemonName: 'Larvesta',
                value: 7000000,
            },
            {
                pokemonId: 636,
                pokemonName: 'Larvesta',
                value: 7000000,
            },
            {
                pokemonId: 133,
                pokemonName: 'Eevee',
                value: 3500000,
            },
        ]);

        await expect(service.getTopSellingPokemons()).resolves.toEqual([
            {
                pokemonId: 636,
                pokemonName: 'Larvesta',
                quantity: 2,
                totalValue: 14000000,
            },
            {
                pokemonId: 133,
                pokemonName: 'Eevee',
                quantity: 1,
                totalValue: 3500000,
            },
        ]);
    });

    it('should get top selling HAs report', async () => {
        orderPokemonsRepositoryMock.find.mockResolvedValue([
            {
                abilityName: 'Flame Body',
                abilityIsHa: true,
                value: 7000000,
            },
            {
                abilityName: 'Flame Body',
                abilityIsHa: true,
                value: 7000000,
            },
            {
                abilityName: 'Run Away',
                abilityIsHa: false,
                value: 3500000,
            },
        ]);

        await expect(service.getTopSellingHas()).resolves.toEqual([
            {
                abilityName: 'Flame Body',
                quantity: 2,
                totalValue: 14000000,
            },
        ]);
    });

    it('should get top buying players report', async () => {
        ordersRepositoryMock.find.mockResolvedValue([
            {
                playerId: 'player-1',
                total: 7000000,
                paidAmount: 3500000,
                player: {
                    nick: 'EKNight008',
                },
            },
            {
                playerId: 'player-1',
                total: 7000000,
                paidAmount: 3500000,
                player: {
                    nick: 'EKNight008',
                },
            },
            {
                playerId: 'player-2',
                total: 3500000,
                paidAmount: 3500000,
                player: {
                    nick: 'OtherPlayer',
                },
            },
        ]);

        await expect(service.getTopBuyingPlayers()).resolves.toEqual([
            {
                playerId: 'player-1',
                nick: 'EKNight008',
                totalOrders: 2,
                totalValue: 14000000,
                paidAmount: 7000000,
            },
            {
                playerId: 'player-2',
                nick: 'OtherPlayer',
                totalOrders: 1,
                totalValue: 3500000,
                paidAmount: 3500000,
            },
        ]);
    });

    it('should get players debt report', async () => {
        ordersRepositoryMock.find.mockResolvedValue([
            {
                playerId: 'player-1',
                total: 7000000,
                paidAmount: 3500000,
                player: {
                    nick: 'EKNight008',
                },
            },
            {
                playerId: 'player-1',
                total: 7000000,
                paidAmount: 7000000,
                player: {
                    nick: 'EKNight008',
                },
            },
            {
                playerId: 'player-2',
                total: 3500000,
                paidAmount: 0,
                player: {
                    nick: 'OtherPlayer',
                },
            },
        ]);

        await expect(service.getPlayersDebt()).resolves.toEqual([
            {
                playerId: 'player-1',
                nick: 'EKNight008',
                debtAmount: 3500000,
                openOrders: 1,
            },
            {
                playerId: 'player-2',
                nick: 'OtherPlayer',
                debtAmount: 3500000,
                openOrders: 1,
            },
        ]);
    });

    it('should get dashboard summary report', async () => {
        playersRepositoryMock.find.mockResolvedValue([
            {
                id: 'player-id',
            },
        ]);

        ordersRepositoryMock.find.mockResolvedValue([
            {
                id: 'active-order-id',
                total: 7000000,
                paidAmount: 3500000,
                archived: false,
            },
            {
                id: 'archived-order-id',
                total: 7000000,
                paidAmount: 7000000,
                archived: true,
            },
        ]);

        orderPokemonsRepositoryMock.find.mockResolvedValue([
            {
                id: 'pokemon-1',
                status: 'Pronto',
            },
            {
                id: 'pokemon-2',
                status: 'Pendente',
            },
            {
                id: 'pokemon-3',
                status: 'pronto',
            },
        ]);

        await expect(service.getDashboardSummary()).resolves.toEqual({
            totalPlayers: 1,
            totalOrders: 2,
            activeOrders: 1,
            archivedOrders: 1,
            totalPokemons: 3,
            completedPokemons: 2,
            totalRevenue: 14000000,
            paidRevenue: 10500000,
            pendingRevenue: 3500000,
        });
    });

    it('should get daily revenue report', async () => {
        ordersRepositoryMock.find.mockResolvedValue([
            {
                id: 'order-1',
                total: 7000000,
                paidAmount: 3500000,
                archived: false,
                createdAt: new Date('2026-06-15T10:00:00.000Z'),
            },
            {
                id: 'order-2',
                total: 7000000,
                paidAmount: 7000000,
                archived: false,
                createdAt: new Date('2026-06-15T18:00:00.000Z'),
            },
            {
                id: 'order-3',
                total: 3500000,
                paidAmount: 0,
                archived: false,
                createdAt: new Date('2026-06-16T10:00:00.000Z'),
            },
        ]);

        await expect(service.getRevenueByDay()).resolves.toEqual([
            {
                date: '2026-06-15',
                totalRevenue: 14000000,
                paidRevenue: 10500000,
                pendingRevenue: 3500000,
                orders: 2,
            },
            {
                date: '2026-06-16',
                totalRevenue: 3500000,
                paidRevenue: 0,
                pendingRevenue: 3500000,
                orders: 1,
            },
        ]);
    });

    it('should get orders by status report', async () => {
        orderPokemonsRepositoryMock.find.mockResolvedValue([
            {
                id: 'pokemon-1',
                status: 'Pendente',
                order: {
                    createdAt: new Date('2026-06-15T10:00:00.000Z'),
                },
            },
            {
                id: 'pokemon-2',
                status: 'Pendente',
                order: {
                    createdAt: new Date('2026-06-15T11:00:00.000Z'),
                },
            },
            {
                id: 'pokemon-3',
                status: 'Pronto',
                order: {
                    createdAt: new Date('2026-06-16T10:00:00.000Z'),
                },
            },
        ]);

        await expect(service.getOrdersByStatus()).resolves.toEqual([
            {
                status: 'Pendente',
                quantity: 2,
            },
            {
                status: 'Pronto',
                quantity: 1,
            },
        ]);
    });
});
