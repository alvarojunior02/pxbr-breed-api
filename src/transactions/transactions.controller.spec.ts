import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

describe('TransactionsController', () => {
    let controller: TransactionsController;

    const transactionsServiceMock = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TransactionsController],
            providers: [
                {
                    provide: TransactionsService,
                    useValue: transactionsServiceMock,
                },
            ],
        }).compile();

        controller = module.get<TransactionsController>(TransactionsController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should list transactions', async () => {
        const query = {
            playerId: 'player-id',
        };

        const transactions = [
            {
                id: 'transaction-id',
                playerId: 'player-id',
                orderId: 'order-id',
                amount: 3500000,
            },
        ];

        transactionsServiceMock.findAll.mockResolvedValue(transactions);

        await expect(controller.findAll(query)).resolves.toEqual(transactions);

        expect(transactionsServiceMock.findAll).toHaveBeenCalledWith(query);
    });

    it('should get transaction by id', async () => {
        const transaction = {
            id: 'transaction-id',
            playerId: 'player-id',
            orderId: 'order-id',
            amount: 3500000,
        };

        transactionsServiceMock.findOne.mockResolvedValue(transaction);

        await expect(controller.findOne('transaction-id')).resolves.toEqual(
            transaction,
        );

        expect(transactionsServiceMock.findOne).toHaveBeenCalledWith(
            'transaction-id',
        );
    });

    it('should create transaction', async () => {
        const dto = {
            playerId: 'player-id',
            orderId: 'order-id',
            amount: 3500000,
            type: 'ORDER_PAYMENT',
            notes: 'Pagamento parcial.',
        };

        const transaction = {
            id: 'transaction-id',
            ...dto,
        };

        transactionsServiceMock.create.mockResolvedValue(transaction);

        await expect(controller.create(dto)).resolves.toEqual(transaction);

        expect(transactionsServiceMock.create).toHaveBeenCalledWith(dto);
    });

    it('should delete transaction', async () => {
        transactionsServiceMock.remove.mockResolvedValue({
            deleted: true,
        });

        await expect(controller.remove('transaction-id')).resolves.toEqual({
            deleted: true,
        });

        expect(transactionsServiceMock.remove).toHaveBeenCalledWith(
            'transaction-id',
        );
    });
});
