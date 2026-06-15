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
});
