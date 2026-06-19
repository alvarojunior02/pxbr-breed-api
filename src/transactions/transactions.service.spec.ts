import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from '../orders/orders.service';
import { PlayersService } from '../players/players.service';
import { Transaction } from './entities/transaction.entity';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
    let service: TransactionsService;

    const repositoryMock = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
    };

    const playersServiceMock = {
        findOne: jest.fn(),
    };

    const ordersServiceMock = {
        findOne: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionsService,
                {
                    provide: getRepositoryToken(Transaction),
                    useValue: repositoryMock,
                },
                {
                    provide: PlayersService,
                    useValue: playersServiceMock,
                },
                {
                    provide: OrdersService,
                    useValue: ordersServiceMock,
                },
            ],
        }).compile();

        service = module.get<TransactionsService>(TransactionsService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should list transactions filtered by player', async () => {
        const transactions = [
            {
                id: 'transaction-id',
                playerId: 'player-id',
                orderId: 'order-id',
                amount: 3500000,
                type: 'ORDER_PAYMENT',
                notes: 'Pagamento parcial.',
                player: {
                    nick: 'EKNight008',
                },
                order: {
                    id: 'order-id',
                },
            },
        ];

        repositoryMock.find.mockResolvedValue(transactions);

        await expect(service.findAll({ playerId: 'player-id' })).resolves.toEqual(transactions);

        expect(repositoryMock.find).toHaveBeenCalledWith({
            relations: {
                player: true,
                order: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    });

    it('should get transaction by id', async () => {
        const transaction = {
            id: 'transaction-id',
            playerId: 'player-id',
            orderId: 'order-id',
            amount: 3500000,
        };

        repositoryMock.findOne.mockResolvedValue(transaction);

        await expect(service.findOne('transaction-id')).resolves.toEqual(transaction);

        expect(repositoryMock.findOne).toHaveBeenCalledWith({
            where: {
                id: 'transaction-id',
            },
            relations: {
                player: true,
                order: true,
            },
        });
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
        repositoryMock.findOne.mockResolvedValue(null);

        await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should create transaction and update order payment values', async () => {
        const dto = {
            playerId: 'player-id',
            orderId: 'order-id',
            amount: 3500000,
            type: 'ORDER_PAYMENT',
            notes: 'Pagamento parcial.',
        };

        const player = {
            id: 'player-id',
        };

        const order = {
            id: 'order-id',
            playerId: 'player-id',
            paidAmount: 0,
            total: 7000000,
        };

        const createdTransaction = {
            id: 'transaction-id',
            ...dto,
        };

        playersServiceMock.findOne.mockResolvedValue(player);
        ordersServiceMock.findOne.mockResolvedValue(order);
        repositoryMock.create.mockReturnValue(createdTransaction);
        repositoryMock.save.mockResolvedValue(createdTransaction);

        repositoryMock.findOne.mockResolvedValue({
            ...createdTransaction,
            player,
            order,
        });

        await expect(service.create(dto)).resolves.toEqual({
            ...createdTransaction,
            player,
            order,
        });

        expect(repositoryMock.create).toHaveBeenCalledWith({
            playerId: player.id,
            orderId: order.id,
            amount: dto.amount,
            type: dto.type,
            notes: dto.notes,
        });

        expect(ordersServiceMock.update).toHaveBeenCalledWith(order.id, {
            paidAmount: 3500000,
            paid: false,
        });
    });

    it('should throw BadRequestException when order does not belong to player', async () => {
        const dto = {
            playerId: 'player-id',
            orderId: 'order-id',
            amount: 3500000,
        };

        playersServiceMock.findOne.mockResolvedValue({
            id: 'player-id',
        });

        ordersServiceMock.findOne.mockResolvedValue({
            id: 'order-id',
            playerId: 'another-player-id',
            paidAmount: 0,
            total: 7000000,
        });

        await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw BadRequestException when amount exceeds remaining amount', async () => {
        const dto = {
            playerId: 'player-id',
            orderId: 'order-id',
            amount: 8000000,
        };

        playersServiceMock.findOne.mockResolvedValue({
            id: 'player-id',
        });

        ordersServiceMock.findOne.mockResolvedValue({
            id: 'order-id',
            playerId: 'player-id',
            paidAmount: 0,
            total: 7000000,
        });

        await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should delete transaction and update order payment values', async () => {
        const transaction = {
            id: 'transaction-id',
            playerId: 'player-id',
            orderId: 'order-id',
            amount: 3500000,
        };

        repositoryMock.findOne.mockResolvedValueOnce(transaction);
        repositoryMock.remove.mockResolvedValue(transaction);
        ordersServiceMock.findOne.mockResolvedValue({
            id: 'order-id',
            paidAmount: 7000000,
            total: 7000000,
        });

        await expect(service.remove('transaction-id')).resolves.toEqual({
            deleted: true,
        });

        expect(repositoryMock.remove).toHaveBeenCalledWith(transaction);
        expect(ordersServiceMock.update).toHaveBeenCalledWith('order-id', {
            paidAmount: 3500000,
            paid: false,
        });
    });
});
