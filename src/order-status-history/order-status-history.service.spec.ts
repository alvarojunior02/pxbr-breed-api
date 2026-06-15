import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from '../orders/orders.service';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrderStatusHistoryService } from './order-status-history.service';

describe('OrderStatusHistoryService', () => {
    let service: OrderStatusHistoryService;

    const repositoryMock = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
    };

    const ordersServiceMock = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderStatusHistoryService,
                {
                    provide: getRepositoryToken(OrderStatusHistory),
                    useValue: repositoryMock,
                },
                {
                    provide: OrdersService,
                    useValue: ordersServiceMock,
                },
            ],
        }).compile();

        service = module.get<OrderStatusHistoryService>(OrderStatusHistoryService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should list history records by order id', async () => {
        const records = [
            {
                id: 'history-id',
                orderId: 'order-id',
                oldStatus: 'Pendente',
                newStatus: 'Em andamento',
            },
        ];

        ordersServiceMock.findOne.mockResolvedValue({ id: 'order-id' });
        repositoryMock.find.mockResolvedValue(records);

        await expect(service.findByOrder('order-id')).resolves.toEqual(records);

        expect(ordersServiceMock.findOne).toHaveBeenCalledWith('order-id');
        expect(repositoryMock.find).toHaveBeenCalledWith({
            where: {
                orderId: 'order-id',
            },
            order: {
                createdAt: 'DESC',
            },
        });
    });

    it('should create a history record', async () => {
        const dto = {
            oldStatus: 'Pendente',
            newStatus: 'Em andamento',
            notes: 'Breed iniciado.',
        };

        const createdHistory = {
            id: 'history-id',
            orderId: 'order-id',
            ...dto,
        };

        ordersServiceMock.findOne.mockResolvedValue({ id: 'order-id' });
        repositoryMock.create.mockReturnValue(createdHistory);
        repositoryMock.save.mockResolvedValue(createdHistory);

        await expect(service.create('order-id', dto)).resolves.toEqual(createdHistory);

        expect(ordersServiceMock.findOne).toHaveBeenCalledWith('order-id');

        expect(repositoryMock.create).toHaveBeenCalledWith({
            orderId: 'order-id',
            orderPokemonId: null,
            pokemonDexId: null,
            pokemonName: null,
            oldStatus: dto.oldStatus,
            newStatus: dto.newStatus,
            notes: dto.notes,
        });

        expect(repositoryMock.save).toHaveBeenCalledWith(createdHistory);
    });

    it('should delete a history record', async () => {
        const history = {
            id: 'history-id',
            orderId: 'order-id',
        };

        repositoryMock.findOne.mockResolvedValue(history);
        repositoryMock.remove.mockResolvedValue(history);

        await expect(service.remove('history-id')).resolves.toEqual({
            deleted: true,
        });

        expect(repositoryMock.findOne).toHaveBeenCalledWith({
            where: {
                id: 'history-id',
            },
        });
        expect(repositoryMock.remove).toHaveBeenCalledWith(history);
    });

    it('should throw NotFoundException when deleting a missing history record', async () => {
        repositoryMock.findOne.mockResolvedValue(null);

        await expect(service.remove('missing-id')).rejects.toBeInstanceOf(NotFoundException);
    });
});
