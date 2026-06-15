import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatusHistoryController } from './order-status-history.controller';
import { OrderStatusHistoryService } from './order-status-history.service';

describe('OrderStatusHistoryController', () => {
    let controller: OrderStatusHistoryController;

    const orderStatusHistoryServiceMock = {
        findByOrder: jest.fn(),
        create: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrderStatusHistoryController],
            providers: [
                {
                    provide: OrderStatusHistoryService,
                    useValue: orderStatusHistoryServiceMock,
                },
            ],
        }).compile();

        controller = module.get<OrderStatusHistoryController>(OrderStatusHistoryController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should list history records by order id', async () => {
        const records = [
            {
                id: 'history-id',
                orderId: 'order-id',
                newStatus: 'Em andamento',
            },
        ];

        orderStatusHistoryServiceMock.findByOrder.mockResolvedValue(records);

        await expect(controller.findByOrder('order-id')).resolves.toEqual(records);

        expect(orderStatusHistoryServiceMock.findByOrder).toHaveBeenCalledWith('order-id');
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

        orderStatusHistoryServiceMock.create.mockResolvedValue(createdHistory);

        await expect(controller.create('order-id', dto)).resolves.toEqual(createdHistory);

        expect(orderStatusHistoryServiceMock.create).toHaveBeenCalledWith('order-id', dto);
    });

    it('should delete a history record', async () => {
        orderStatusHistoryServiceMock.remove.mockResolvedValue({
            deleted: true,
        });

        await expect(controller.remove('history-id')).resolves.toEqual({
            deleted: true,
        });

        expect(orderStatusHistoryServiceMock.remove).toHaveBeenCalledWith('history-id');
    });
});
