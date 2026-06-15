import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayersService } from '../players/players.service';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
    let service: OrdersService;

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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: repositoryMock,
                },
                {
                    provide: PlayersService,
                    useValue: playersServiceMock,
                },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should list orders', async () => {
        const orders = [
            {
                id: 'order-id',
                playerId: 'player-id',
                paidAmount: 0,
                total: 7000000,
                archived: false,
                player: {
                    nick: 'EKNight008',
                },
                pokemons: [
                    {
                        pokemonName: 'Larvesta',
                        status: 'Pendente',
                    },
                ],
            },
        ];

        repositoryMock.find.mockResolvedValue(orders);

        await expect(service.findAll({})).resolves.toEqual(orders);

        expect(repositoryMock.find).toHaveBeenCalledWith({
            relations: {
                player: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    });

    it('should filter orders by player id', async () => {
        const orders = [
            {
                id: 'order-1',
                playerId: 'player-1',
                paidAmount: 0,
                total: 7000000,
                archived: false,
                pokemons: [],
            },
            {
                id: 'order-2',
                playerId: 'player-2',
                paidAmount: 0,
                total: 7000000,
                archived: false,
                pokemons: [],
            },
        ];

        repositoryMock.find.mockResolvedValue(orders);

        await expect(
            service.findAll({ playerId: 'player-1' }),
        ).resolves.toEqual([orders[0]]);
    });

    it('should filter orders by pokemon status', async () => {
        const orders = [
            {
                id: 'order-1',
                playerId: 'player-id',
                paidAmount: 0,
                total: 7000000,
                archived: false,
                pokemons: [
                    {
                        status: 'Pendente',
                    },
                ],
            },
            {
                id: 'order-2',
                playerId: 'player-id',
                paidAmount: 0,
                total: 7000000,
                archived: false,
                pokemons: [
                    {
                        status: 'Pronto',
                    },
                ],
            },
        ];

        repositoryMock.find.mockResolvedValue(orders);

        await expect(service.findAll({ status: 'Pronto' })).resolves.toEqual([
            orders[1],
        ]);
    });

    it('should filter orders by payment status', async () => {
        const orders = [
            {
                id: 'paid-order',
                playerId: 'player-id',
                paidAmount: 7000000,
                total: 7000000,
                archived: false,
                pokemons: [],
            },
            {
                id: 'partial-order',
                playerId: 'player-id',
                paidAmount: 3500000,
                total: 7000000,
                archived: false,
                pokemons: [],
            },
            {
                id: 'pending-order',
                playerId: 'player-id',
                paidAmount: 0,
                total: 7000000,
                archived: false,
                pokemons: [],
            },
        ];

        repositoryMock.find.mockResolvedValue(orders);

        await expect(
            service.findAll({ paymentStatus: 'partial' }),
        ).resolves.toEqual([orders[1]]);
    });

    it('should get order by id', async () => {
        const order = {
            id: 'order-id',
            playerId: 'player-id',
            total: 7000000,
        };

        repositoryMock.findOne.mockResolvedValue(order);

        await expect(service.findOne('order-id')).resolves.toEqual(order);

        expect(repositoryMock.findOne).toHaveBeenCalledWith({
            where: {
                id: 'order-id',
            },
            relations: {
                player: true,
            },
        });
    });

    it('should throw NotFoundException when order does not exist', async () => {
        repositoryMock.findOne.mockResolvedValue(null);

        await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
            NotFoundException,
        );
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
                    sprite: 'sprite-url',
                    breedPokemonId: 636,
                    breedPokemonName: 'Larvesta',
                    nature: 'Timid',
                    abilityName: 'Flame Body',
                    abilityIsHa: false,
                    regionalForm: null,
                    regionalFormLabel: null,
                    regionalFormDisplayName: null,
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

        playersServiceMock.findOne.mockResolvedValue({
            id: 'player-id',
        });
        repositoryMock.create.mockReturnValue(order);
        repositoryMock.save.mockResolvedValue(order);

        await expect(service.create(dto)).resolves.toEqual(order);

        expect(playersServiceMock.findOne).toHaveBeenCalledWith('player-id');
        expect(repositoryMock.save).toHaveBeenCalledWith(order);
    });

    it('should update order', async () => {
        const order = {
            id: 'order-id',
            playerId: 'player-id',
            subtotal: 7000000,
            discount: 0,
            total: 7000000,
            paidAmount: 0,
            paid: false,
            needsFemale: false,
            observations: 'Pedido inicial.',
            archived: false,
            pokemons: [],
        };

        const dto = {
            paidAmount: 7000000,
            observations: 'Pago.',
        };

        repositoryMock.findOne.mockResolvedValue(order);
        repositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );

        await expect(service.update('order-id', dto)).resolves.toEqual({
            ...order,
            ...dto,
            paid: true,
        });

        expect(repositoryMock.save).toHaveBeenCalledWith({
            ...order,
            ...dto,
            paid: true,
        });
    });

    it('should validate new player when updating player id', async () => {
        const order = {
            id: 'order-id',
            playerId: 'old-player-id',
            subtotal: 7000000,
            discount: 0,
            total: 7000000,
            paidAmount: 0,
            paid: false,
            needsFemale: false,
            observations: null,
            archived: false,
            pokemons: [],
        };

        const dto = {
            playerId: 'new-player-id',
        };

        repositoryMock.findOne.mockResolvedValue(order);
        repositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );
        playersServiceMock.findOne.mockResolvedValue({
            id: 'new-player-id',
        });

        await service.update('order-id', dto);

        expect(playersServiceMock.findOne).toHaveBeenCalledWith(
            'new-player-id',
        );
    });

    it('should delete order', async () => {
        const order = {
            id: 'order-id',
            playerId: 'player-id',
        };

        repositoryMock.findOne.mockResolvedValue(order);
        repositoryMock.remove.mockResolvedValue(order);

        await expect(service.remove('order-id')).resolves.toEqual({
            deleted: true,
        });

        expect(repositoryMock.remove).toHaveBeenCalledWith(order);
    });

    it('should create order with nullable ability name', async () => {
        const dto = {
            playerId: 'player-id',
            subtotal: 7000000,
            discount: 0,
            total: 7000000,
            paidAmount: 0,
            paid: false,
            needsFemale: false,
            observations: null,
            archived: false,
            pokemons: [
                {
                    pokemonId: 636,
                    pokemonName: 'Larvesta',
                    sprite: 'sprite-url',
                    breedPokemonId: 636,
                    breedPokemonName: 'Larvesta',
                    nature: 'Timid',
                    abilityName: undefined,
                    abilityIsHa: false,
                    regionalForm: null,
                    regionalFormLabel: null,
                    regionalFormDisplayName: null,
                    value: 7000000,
                    breedable: true,
                    status: 'Pendente',
                },
            ],
        };

        const order = {
            id: 'order-id',
            ...dto,
            pokemons: [
                {
                    ...dto.pokemons[0],
                    abilityName: null,
                },
            ],
        };

        playersServiceMock.findOne.mockResolvedValue({
            id: 'player-id',
        });
        repositoryMock.create.mockReturnValue(order);
        repositoryMock.save.mockResolvedValue(order);

        await expect(service.create(dto)).resolves.toEqual(order);

        expect(repositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                pokemons: [
                    expect.objectContaining({
                        abilityName: null,
                    }),
                ],
            }),
        );
    });
});
