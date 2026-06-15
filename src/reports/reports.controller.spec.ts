import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
    let controller: ReportsController;

    const reportsServiceMock = {
        getTopSellingPokemons: jest.fn(),
        getTopSellingHas: jest.fn(),
        getTopBuyingPlayers: jest.fn(),
        getPlayersDebt: jest.fn(),
        getDashboardSummary: jest.fn(),
        getRevenueByDay: jest.fn(),
        getOrdersByStatus: jest.fn(),
        getOrdersByDay: jest.fn(),
        getHaVsRegularSales: jest.fn(),
        getPaymentsByPlayer: jest.fn(),
        getRevenueSummary: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReportsController],
            providers: [
                {
                    provide: ReportsService,
                    useValue: reportsServiceMock,
                },
            ],
        }).compile();

        controller = module.get<ReportsController>(ReportsController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should get top selling Pokémons report', async () => {
        const report = [
            {
                pokemonId: 636,
                pokemonName: 'Larvesta',
                quantity: 2,
                totalValue: 14000000,
            },
        ];

        reportsServiceMock.getTopSellingPokemons.mockResolvedValue(report);

        await expect(controller.getTopSellingPokemons()).resolves.toEqual(
            report,
        );

        expect(reportsServiceMock.getTopSellingPokemons).toHaveBeenCalled();
    });

    it('should get top selling HAs report', async () => {
        const report = [
            {
                abilityName: 'Flame Body',
                quantity: 2,
                totalValue: 14000000,
            },
        ];

        reportsServiceMock.getTopSellingHas.mockResolvedValue(report);

        await expect(controller.getTopSellingHas()).resolves.toEqual(report);

        expect(reportsServiceMock.getTopSellingHas).toHaveBeenCalled();
    });

    it('should get top buying players report', async () => {
        const report = [
            {
                playerId: 'player-id',
                nick: 'EKNight008',
                totalOrders: 2,
                totalValue: 14000000,
                paidAmount: 7000000,
            },
        ];

        reportsServiceMock.getTopBuyingPlayers.mockResolvedValue(report);

        await expect(controller.getTopBuyingPlayers()).resolves.toEqual(report);

        expect(reportsServiceMock.getTopBuyingPlayers).toHaveBeenCalled();
    });

    it('should get players debt report', async () => {
        const report = [
            {
                playerId: 'player-id',
                nick: 'EKNight008',
                debtAmount: 7000000,
                openOrders: 1,
            },
        ];

        reportsServiceMock.getPlayersDebt.mockResolvedValue(report);

        await expect(controller.getPlayersDebt()).resolves.toEqual(report);

        expect(reportsServiceMock.getPlayersDebt).toHaveBeenCalled();
    });

    it('should get dashboard summary report', async () => {
        const report = {
            totalPlayers: 1,
            totalOrders: 2,
            activeOrders: 1,
            archivedOrders: 1,
            totalPokemons: 3,
            completedPokemons: 1,
            totalRevenue: 14000000,
            paidRevenue: 7000000,
            pendingRevenue: 7000000,
        };

        reportsServiceMock.getDashboardSummary.mockResolvedValue(report);

        await expect(controller.getDashboardSummary()).resolves.toEqual(report);

        expect(reportsServiceMock.getDashboardSummary).toHaveBeenCalled();
    });

    it('should get daily revenue report', async () => {
        const query = {
            startDate: '2026-06-01',
            endDate: '2026-06-30',
        };

        const report = [
            {
                date: '2026-06-15',
                totalRevenue: 14000000,
                paidRevenue: 7000000,
                pendingRevenue: 7000000,
                orders: 2,
            },
        ];

        reportsServiceMock.getRevenueByDay.mockResolvedValue(report);

        await expect(controller.getRevenueByDay(query)).resolves.toEqual(report);

        expect(reportsServiceMock.getRevenueByDay).toHaveBeenCalledWith(query);
    });

    it('should get orders by status report', async () => {
        const query = {
            startDate: '2026-06-01',
            endDate: '2026-06-30',
        };

        const report = [
            {
                status: 'Pendente',
                quantity: 8,
            },
            {
                status: 'Pronto',
                quantity: 3,
            },
        ];

        reportsServiceMock.getOrdersByStatus.mockResolvedValue(report);

        await expect(controller.getOrdersByStatus(query)).resolves.toEqual(report);

        expect(reportsServiceMock.getOrdersByStatus).toHaveBeenCalledWith(query);
    });

    it('should get daily orders report', async () => {
        const query = {
            startDate: '2026-06-01',
            endDate: '2026-06-30',
        };

        const report = [
            {
                date: '2026-06-15',
                orders: 4,
                pokemons: 9,
            },
        ];

        reportsServiceMock.getOrdersByDay.mockResolvedValue(report);

        await expect(controller.getOrdersByDay(query)).resolves.toEqual(report);

        expect(reportsServiceMock.getOrdersByDay).toHaveBeenCalledWith(query);
    });

    it('should get HA vs regular sales report', async () => {
        const query = {
            startDate: '2026-06-01',
            endDate: '2026-06-30',
        };

        const report = [
            {
                type: 'HA',
                quantity: 8,
                totalValue: 56000000,
            },
            {
                type: 'Regular',
                quantity: 12,
                totalValue: 42000000,
            },
        ];

        reportsServiceMock.getHaVsRegularSales.mockResolvedValue(report);

        await expect(controller.getHaVsRegularSales(query)).resolves.toEqual(report);

        expect(reportsServiceMock.getHaVsRegularSales).toHaveBeenCalledWith(query);
    });

    it('should get payments by player report', async () => {
        const query = {
            startDate: '2026-06-01',
            endDate: '2026-06-30',
            limit: 5,
        };

        const report = [
            {
                playerId: 'player-id',
                nick: 'EKNight008',
                totalPaid: 18000000,
                transactions: 3,
            },
        ];

        reportsServiceMock.getPaymentsByPlayer.mockResolvedValue(report);

        await expect(controller.getPaymentsByPlayer(query)).resolves.toEqual(report);

        expect(reportsServiceMock.getPaymentsByPlayer).toHaveBeenCalledWith(query);
    });

    it('should get revenue summary report', async () => {
        const query = {
            startDate: '2026-06-01',
            endDate: '2026-06-30',
        };

        const report = {
            totalRevenue: 100000000,
            paidRevenue: 70000000,
            pendingRevenue: 30000000,
            averageOrderValue: 12500000,
            orders: 8,
        };

        reportsServiceMock.getRevenueSummary.mockResolvedValue(report);

        await expect(controller.getRevenueSummary(query)).resolves.toEqual(report);

        expect(reportsServiceMock.getRevenueSummary).toHaveBeenCalledWith(query);
    });
});
