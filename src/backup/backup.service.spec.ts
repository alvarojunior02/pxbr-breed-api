import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderStatusHistory } from '../order-status-history/entities/order-status-history.entity';
import { Order } from '../orders/entities/order.entity';
import { OwnedHa } from '../owned-has/entities/owned-ha.entity';
import { OwnedPokemon } from '../owned-pokemons/entities/owned-pokemon.entity';
import { Player } from '../players/entities/player.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { BackupService } from './backup.service';
import { Settings } from '../settings/entities/settings.entity';

describe('BackupService', () => {
    let service: BackupService;

    const playersRepositoryMock = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const ordersRepositoryMock = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const transactionsRepositoryMock = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const orderStatusHistoryRepositoryMock = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const ownedPokemonsRepositoryMock = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const ownedHasRepositoryMock = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const settingsRepositoryMock = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BackupService,
                {
                    provide: getRepositoryToken(Player),
                    useValue: playersRepositoryMock,
                },
                {
                    provide: getRepositoryToken(Order),
                    useValue: ordersRepositoryMock,
                },
                {
                    provide: getRepositoryToken(Transaction),
                    useValue: transactionsRepositoryMock,
                },
                {
                    provide: getRepositoryToken(OrderStatusHistory),
                    useValue: orderStatusHistoryRepositoryMock,
                },
                {
                    provide: getRepositoryToken(OwnedPokemon),
                    useValue: ownedPokemonsRepositoryMock,
                },
                {
                    provide: getRepositoryToken(OwnedHa),
                    useValue: ownedHasRepositoryMock,
                },
                {
                    provide: getRepositoryToken(Settings),
                    useValue: settingsRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<BackupService>(BackupService);

        jest.clearAllMocks();

        settingsRepositoryMock.findOne.mockResolvedValue(null);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should export backup', async () => {
        const players = [
            {
                id: 'player-id',
                nick: 'EKNight008',
            },
        ];

        const orders = [
            {
                id: 'order-id',
                playerId: 'player-id',
            },
        ];

        const transactions = [
            {
                id: 'transaction-id',
                playerId: 'player-id',
                orderId: 'order-id',
            },
        ];

        const orderStatusHistory = [
            {
                id: 'history-id',
                orderId: 'order-id',
                newStatus: 'Em andamento',
            },
        ];

        const ownedPokemons = [
            {
                id: 'owned-pokemon-id',
                pokemonName: 'Larvesta',
            },
        ];

        const ownedHas = [
            {
                id: 'owned-ha-id',
                abilityName: 'Flame Body',
            },
        ];

        playersRepositoryMock.find.mockResolvedValue(players);
        ordersRepositoryMock.find.mockResolvedValue(orders);
        transactionsRepositoryMock.find.mockResolvedValue(transactions);
        orderStatusHistoryRepositoryMock.find.mockResolvedValue(
            orderStatusHistory,
        );
        ownedPokemonsRepositoryMock.find.mockResolvedValue(ownedPokemons);
        ownedHasRepositoryMock.find.mockResolvedValue(ownedHas);

        const systemSettings = {
            id: 'settings-id',
            breedableDefaultValue: 14000000,
            castratedDefaultValue: 3500000,
            backupVersion: 1,
        };

        settingsRepositoryMock.findOne.mockResolvedValue(systemSettings);

        const result = await service.exportBackup();

        expect(result).toMatchObject({
            version: 1,
            data: {
                players,
                orders,
                transactions,
                orderStatusHistory,
                ownedPokemons,
                ownedHas,
                ownedHiddenAbilities: ownedHas,
                settings: systemSettings,
                systemSettings,
            },
        });

        expect(result.exportedAt).toEqual(expect.any(String));

        expect(playersRepositoryMock.find).toHaveBeenCalledWith({
            order: {
                createdAt: 'DESC',
            },
        });
        expect(ordersRepositoryMock.find).toHaveBeenCalledWith({
            order: {
                createdAt: 'DESC',
            },
        });
        expect(transactionsRepositoryMock.find).toHaveBeenCalledWith({
            order: {
                createdAt: 'DESC',
            },
        });
        expect(orderStatusHistoryRepositoryMock.find).toHaveBeenCalledWith({
            order: {
                createdAt: 'DESC',
            },
        });
        expect(ownedPokemonsRepositoryMock.find).toHaveBeenCalledWith({
            order: {
                createdAt: 'DESC',
            },
        });
        expect(ownedHasRepositoryMock.find).toHaveBeenCalledWith({
            order: {
                createdAt: 'DESC',
            },
        });
    });

    it('should import backup incrementally using wrapped data payload', async () => {
        const dto = {
            data: {
                players: [
                    {
                        id: 'player-id',
                        nick: 'EKNight008',
                        avatarUrl: 'avatar-url',
                        orders: [],
                    },
                ],
                orders: [
                    {
                        id: 'order-id',
                        playerId: 'player-id',
                        subtotal: 7000000,
                        discount: 0,
                        total: 7000000,
                        paidAmount: 0,
                        paid: false,
                        needsFemale: false,
                        observations: null,
                        archived: false,
                        player: {
                            id: 'player-id',
                        },
                        transactions: [],
                        statusHistory: [],
                        pokemons: [
                            {
                                id: 'order-pokemon-id',
                                pokemonId: 636,
                                pokemonName: 'Larvesta',
                                order: {
                                    id: 'order-id',
                                },
                            },
                        ],
                    },
                ],
                transactions: [
                    {
                        id: 'transaction-id',
                        playerId: 'player-id',
                        orderId: 'order-id',
                        amount: 3500000,
                        player: {
                            id: 'player-id',
                        },
                        order: {
                            id: 'order-id',
                        },
                    },
                ],
                orderStatusHistory: [
                    {
                        id: 'history-id',
                        orderId: 'order-id',
                        newStatus: 'Em andamento',
                        order: {
                            id: 'order-id',
                        },
                    },
                ],
                ownedPokemons: [
                    {
                        id: 'owned-pokemon-id',
                        pokemonDexId: 636,
                        pokemonName: 'Larvesta',
                        status: 'F5 PFT',
                        gender: 'Fêmea',
                    },
                ],
                ownedHas: [
                    {
                        id: 'owned-ha-id',
                        abilityName: 'Flame Body',
                        nature: 'Timid',
                        breedableValue: 14000000,
                        castratedValue: 3500000,
                        pokemons: [
                            {
                                id: 'owned-ha-pokemon-id',
                                pokemonDexId: 636,
                                pokemonName: 'Larvesta',
                                ownedHa: {
                                    id: 'owned-ha-id',
                                },
                            },
                        ],
                    },
                ],
                systemSettings: {
                    id: 'settings-id',
                    breedableDefaultValue: 14000000,
                    castratedDefaultValue: 3500000,
                    backupVersion: 1,
                },
            },
        };

        playersRepositoryMock.findOne.mockResolvedValue(null);
        ordersRepositoryMock.findOne.mockResolvedValue(null);
        transactionsRepositoryMock.findOne.mockResolvedValue(null);
        orderStatusHistoryRepositoryMock.findOne.mockResolvedValue(null);
        ownedPokemonsRepositoryMock.findOne.mockResolvedValue(null);
        ownedHasRepositoryMock.findOne.mockResolvedValue(null);
        settingsRepositoryMock.findOne.mockResolvedValue(null);

        playersRepositoryMock.create.mockImplementation((value) => value);
        ordersRepositoryMock.create.mockImplementation((value) => value);
        transactionsRepositoryMock.create.mockImplementation((value) => value);
        orderStatusHistoryRepositoryMock.create.mockImplementation(
            (value) => value,
        );
        ownedPokemonsRepositoryMock.create.mockImplementation((value) => value);
        ownedHasRepositoryMock.create.mockImplementation((value) => value);
        settingsRepositoryMock.create.mockImplementation((value) => value);

        playersRepositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );
        ordersRepositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );
        transactionsRepositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );
        orderStatusHistoryRepositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );
        ownedPokemonsRepositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );
        ownedHasRepositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );
        settingsRepositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );

        const result = await service.importBackup(dto);

        expect(result).toMatchObject({
            success: true,
            mode: 'incremental',
            summary: {
                players: {
                    imported: 1,
                    skipped: 0,
                    invalid: 0,
                },
                orders: {
                    imported: 1,
                    skipped: 0,
                    invalid: 0,
                },
                transactions: {
                    imported: 1,
                    skipped: 0,
                    invalid: 0,
                },
                orderStatusHistory: {
                    imported: 1,
                    skipped: 0,
                    invalid: 0,
                },
                ownedPokemons: {
                    imported: 1,
                    skipped: 0,
                    invalid: 0,
                },
                ownedHas: {
                    imported: 1,
                    skipped: 0,
                    invalid: 0,
                },
                settings: {
                    imported: 1,
                    skipped: 0,
                    invalid: 0,
                },
            },
        });

        expect(playersRepositoryMock.create).toHaveBeenCalledWith({
            id: 'player-id',
            nick: 'EKNight008',
            avatarUrl: 'avatar-url',
        });

        expect(ordersRepositoryMock.create).toHaveBeenCalledWith({
            id: 'order-id',
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
                    id: 'order-pokemon-id',
                    pokemonId: 636,
                    pokemonName: 'Larvesta',
                    abilityName: null,
                },
            ],
        });

        expect(transactionsRepositoryMock.create).toHaveBeenCalledWith({
            id: 'transaction-id',
            playerId: 'player-id',
            orderId: 'order-id',
            amount: 3500000,
        });

        expect(orderStatusHistoryRepositoryMock.create).toHaveBeenCalledWith({
            id: 'history-id',
            orderId: 'order-id',
            newStatus: 'Em andamento',
        });

        expect(ownedPokemonsRepositoryMock.create).toHaveBeenCalledWith({
            id: 'owned-pokemon-id',
            pokemonDexId: 636,
            pokemonName: 'Larvesta',
            pokemonSprite: null,
            breedBaseDexId: null,
            breedBaseName: null,
            status: 'F5 PFT',
            gender: 'Fêmea',
            nature: null,
            notes: null,
        });

        expect(ownedHasRepositoryMock.create).toHaveBeenCalledWith({
            id: 'owned-ha-id',
            abilityName: 'Flame Body',
            nature: 'Timid',
            breedableValue: 14000000,
            castratedValue: 3500000,
            pokemons: [
                {
                    id: 'owned-ha-pokemon-id',
                    pokemonDexId: 636,
                    pokemonName: 'Larvesta',
                },
            ],
        });

        expect(settingsRepositoryMock.create).toHaveBeenCalledWith({
            id: 'settings-id',
            breedableDefaultValue: 14000000,
            castratedDefaultValue: 3500000,
            backupVersion: 1,
        });
    });

    it('should skip records that already exist during import', async () => {
        const dto = {
            players: [
                {
                    id: 'existing-player-id',
                    nick: 'EKNight008',
                },
            ],
            orders: [],
            transactions: [],
            orderStatusHistory: [],
            ownedPokemons: [],
            ownedHas: [],
        };

        playersRepositoryMock.findOne.mockResolvedValue({
            id: 'existing-player-id',
        });

        const result = await service.importBackup(dto);

        expect(result.summary.players).toEqual({
            imported: 0,
            skipped: 1,
            invalid: 0,
        });

        expect(playersRepositoryMock.create).not.toHaveBeenCalled();
        expect(playersRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should import records without id as new records', async () => {
        const dto = {
            ownedPokemons: [
                {
                    pokemonDexId: 636,
                    pokemonName: 'Larvesta',
                    status: 'F5 PFT',
                    gender: 'Fêmea',
                },
            ],
        };

        ownedPokemonsRepositoryMock.create.mockImplementation((value) => value);
        ownedPokemonsRepositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );

        const result = await service.importBackup(dto);

        expect(result.summary.ownedPokemons).toEqual({
            imported: 1,
            skipped: 0,
            invalid: 0,
        });

        expect(ownedPokemonsRepositoryMock.findOne).not.toHaveBeenCalled();
        expect(ownedPokemonsRepositoryMock.create).toHaveBeenCalledWith({
            pokemonDexId: 636,
            pokemonName: 'Larvesta',
            pokemonSprite: null,
            breedBaseDexId: null,
            breedBaseName: null,
            status: 'F5 PFT',
            gender: 'Fêmea',
            nature: null,
            notes: null,
        });
    });

    it('should mark dependent records as invalid when references do not exist', async () => {
        const dto = {
            orders: [
                {
                    id: 'order-id',
                    playerId: 'missing-player-id',
                    subtotal: 7000000,
                    discount: 0,
                    total: 7000000,
                    paidAmount: 0,
                    paid: false,
                    needsFemale: false,
                    archived: false,
                    pokemons: [],
                },
            ],
            transactions: [
                {
                    id: 'transaction-id',
                    playerId: 'missing-player-id',
                    orderId: 'missing-order-id',
                    amount: 3500000,
                },
            ],
            orderStatusHistory: [
                {
                    id: 'history-id',
                    orderId: 'missing-order-id',
                    newStatus: 'Em andamento',
                },
            ],
        };

        playersRepositoryMock.findOne.mockResolvedValue(null);
        ordersRepositoryMock.findOne.mockResolvedValue(null);
        transactionsRepositoryMock.findOne.mockResolvedValue(null);
        orderStatusHistoryRepositoryMock.findOne.mockResolvedValue(null);

        const result = await service.importBackup(dto);

        expect(result.summary.orders).toEqual({
            imported: 0,
            skipped: 0,
            invalid: 1,
        });
        expect(result.summary.transactions).toEqual({
            imported: 0,
            skipped: 0,
            invalid: 1,
        });
        expect(result.summary.orderStatusHistory).toEqual({
            imported: 0,
            skipped: 0,
            invalid: 1,
        });

        expect(ordersRepositoryMock.save).not.toHaveBeenCalled();
        expect(transactionsRepositoryMock.save).not.toHaveBeenCalled();
        expect(orderStatusHistoryRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should normalize missing order pokemon ability name during import', async () => {
        const dto = {
            data: {
                players: [
                    {
                        id: 'player-id',
                        nick: 'EKNight008',
                    },
                ],
                orders: [
                    {
                        id: 'order-id',
                        playerId: 'player-id',
                        subtotal: 7000000,
                        discount: 0,
                        total: 7000000,
                        paidAmount: 0,
                        paid: false,
                        needsFemale: false,
                        archived: false,
                        pokemons: [
                            {
                                id: 'order-pokemon-id',
                                pokemonId: 636,
                                pokemonName: 'Larvesta',
                                nature: 'Timid',
                                abilityIsHa: false,
                                value: 7000000,
                                breedable: true,
                                status: 'Pendente',
                            },
                        ],
                    },
                ],
            },
        };

        playersRepositoryMock.findOne.mockResolvedValue(null);
        ordersRepositoryMock.findOne.mockResolvedValue(null);

        playersRepositoryMock.create.mockImplementation((value) => value);
        ordersRepositoryMock.create.mockImplementation((value) => value);

        playersRepositoryMock.save.mockImplementation((value) => Promise.resolve(value));
        ordersRepositoryMock.save.mockImplementation((value) => Promise.resolve(value));

        await service.importBackup(dto);

        expect(ordersRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                pokemons: [
                    expect.objectContaining({
                        abilityName: null,
                    }),
                ],
            }),
        );
    });

    it('should normalize legacy owned Pokémon fields during import', async () => {
        const dto = {
            ownedPokemons: [
                {
                    id: 'owned-pokemon-id',
                    pokemonId: 636,
                    name: 'Larvesta',
                    sprite: 'sprite-url',
                    breedPokemonId: 636,
                    breedPokemonName: 'Larvesta',
                    status: 'F5 PFT',
                    gender: 'Fêmea',
                    observations: 'Serve para time de Sol.',
                },
            ],
        };

        ownedPokemonsRepositoryMock.findOne.mockResolvedValue(null);
        ownedPokemonsRepositoryMock.create.mockImplementation((value) => value);
        ownedPokemonsRepositoryMock.save.mockImplementation((value) => Promise.resolve(value));

        const result = await service.importBackup(dto);

        expect(result.summary.ownedPokemons).toEqual({
            imported: 1,
            skipped: 0,
            invalid: 0,
        });

        expect(ownedPokemonsRepositoryMock.create).toHaveBeenCalledWith({
            id: 'owned-pokemon-id',
            pokemonId: 636,
            name: 'Larvesta',
            sprite: 'sprite-url',
            breedPokemonId: 636,
            breedPokemonName: 'Larvesta',
            status: 'F5 PFT',
            gender: 'Fêmea',
            observations: 'Serve para time de Sol.',
            pokemonDexId: 636,
            pokemonName: 'Larvesta',
            pokemonSprite: 'sprite-url',
            breedBaseDexId: 636,
            breedBaseName: 'Larvesta',
            nature: null,
            notes: 'Serve para time de Sol.',
        });
    });
});
