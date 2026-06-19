import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
    let controller: OrdersController;

    const ordersServiceMock = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrdersController],
            providers: [
                {
                    provide: OrdersService,
                    useValue: ordersServiceMock,
                },
            ],
        }).compile();

        controller = module.get<OrdersController>(OrdersController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should list orders', async () => {
        const query = {
            playerId: 'player-id',
        };

        const orders = [
            {
                id: 'order-id',
                playerId: 'player-id',
                total: 7000000,
            },
        ];

        ordersServiceMock.findAll.mockResolvedValue(orders);

        await expect(controller.findAll(query)).resolves.toEqual(orders);

        expect(ordersServiceMock.findAll).toHaveBeenCalledWith(query);
    });

    it('should get order by id', async () => {
        const order = {
            id: 'order-id',
            playerId: 'player-id',
            total: 7000000,
        };

        ordersServiceMock.findOne.mockResolvedValue(order);

        await expect(controller.findOne('order-id')).resolves.toEqual(order);

        expect(ordersServiceMock.findOne).toHaveBeenCalledWith('order-id');
    });

    it('should create order', async () => {
        const dto = {
            playerId: 'player-id',
            subtotal: 7000000,
            discount: 0,
            total: 7000000,
            paidAmount: 0,
            paid: false,
            needsFemale: false,
            observations: 'Pedido inicial.',
            archived: false,
            pokemons: [
                {
                    pokemonId: 636,
                    pokemonName: 'Larvesta',
                    value: 7000000,
                    breedable: true,
                    status: 'Pendente',
                },
            ],
        };

        const order = {
            id: 'order-id',
            ...dto,
        };

        ordersServiceMock.create.mockResolvedValue(order);

        await expect(controller.create(dto)).resolves.toEqual(order);

        expect(ordersServiceMock.create).toHaveBeenCalledWith(dto);
    });

    it('should update order', async () => {
        const dto = {
            paidAmount: 3500000,
            observations: 'Pagamento parcial.',
        };

        const order = {
            id: 'order-id',
            playerId: 'player-id',
            total: 7000000,
            ...dto,
        };

        ordersServiceMock.update.mockResolvedValue(order);

        await expect(controller.update('order-id', dto)).resolves.toEqual(order);

        expect(ordersServiceMock.update).toHaveBeenCalledWith('order-id', dto);
    });

    it('should delete order', async () => {
        ordersServiceMock.remove.mockResolvedValue({
            deleted: true,
        });

        await expect(controller.remove('order-id')).resolves.toEqual({
            deleted: true,
        });

        expect(ordersServiceMock.remove).toHaveBeenCalledWith('order-id');
    });
});
