import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OwnedHa } from './entities/owned-ha.entity';
import { OwnedHasService } from './owned-has.service';

describe('OwnedHasService', () => {
    let service: OwnedHasService;

    const repositoryMock = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OwnedHasService,
                {
                    provide: getRepositoryToken(OwnedHa),
                    useValue: repositoryMock,
                },
            ],
        }).compile();

        service = module.get<OwnedHasService>(OwnedHasService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should list owned HAs', async () => {
        const ownedHas = [
            {
                id: 'owned-ha-id',
                abilityName: 'Flame Body',
                nature: 'Timid',
                breedableValue: 14000000,
                castratedValue: 3500000,
                pokemons: [
                    {
                        pokemonDexId: 636,
                        pokemonName: 'Larvesta',
                    },
                ],
            },
        ];

        repositoryMock.find.mockResolvedValue(ownedHas);

        await expect(service.findAll({})).resolves.toEqual(ownedHas);

        expect(repositoryMock.find).toHaveBeenCalledWith({
            order: {
                createdAt: 'DESC',
            },
        });
    });

    it('should filter owned HAs by search', async () => {
        const ownedHas = [
            {
                id: 'larvesta-ha-id',
                abilityName: 'Flame Body',
                nature: 'Timid',
                notes: 'Tenho macho e fêmea breedável.',
                breedableValue: 14000000,
                castratedValue: 3500000,
                pokemons: [
                    {
                        pokemonDexId: 636,
                        pokemonName: 'Larvesta',
                    },
                ],
            },
            {
                id: 'eevee-ha-id',
                abilityName: 'Anticipation',
                nature: null,
                notes: null,
                breedableValue: 14000000,
                castratedValue: 3500000,
                pokemons: [
                    {
                        pokemonDexId: 133,
                        pokemonName: 'Eevee',
                    },
                ],
            },
        ];

        repositoryMock.find.mockResolvedValue(ownedHas);

        await expect(service.findAll({ search: 'larvesta' })).resolves.toEqual([
            ownedHas[0],
        ]);
    });

    it('should filter owned HAs by nature', async () => {
        const ownedHas = [
            {
                id: 'timid-ha-id',
                abilityName: 'Flame Body',
                nature: 'Timid',
                pokemons: [],
            },
            {
                id: 'modest-ha-id',
                abilityName: 'Drought',
                nature: 'Modest',
                pokemons: [],
            },
        ];

        repositoryMock.find.mockResolvedValue(ownedHas);

        await expect(service.findAll({ nature: 'Timid' })).resolves.toEqual([
            ownedHas[0],
        ]);
    });

    it('should filter owned HAs by pokemon dex id', async () => {
        const ownedHas = [
            {
                id: 'larvesta-ha-id',
                abilityName: 'Flame Body',
                nature: 'Timid',
                pokemons: [
                    {
                        pokemonDexId: 636,
                        pokemonName: 'Larvesta',
                    },
                ],
            },
            {
                id: 'eevee-ha-id',
                abilityName: 'Anticipation',
                nature: null,
                pokemons: [
                    {
                        pokemonDexId: 133,
                        pokemonName: 'Eevee',
                    },
                ],
            },
        ];

        repositoryMock.find.mockResolvedValue(ownedHas);

        await expect(service.findAll({ pokemonDexId: 133 })).resolves.toEqual([
            ownedHas[1],
        ]);
    });

    it('should get owned HA by id', async () => {
        const ownedHa = {
            id: 'owned-ha-id',
            abilityName: 'Flame Body',
            nature: 'Timid',
        };

        repositoryMock.findOne.mockResolvedValue(ownedHa);

        await expect(service.findOne('owned-ha-id')).resolves.toEqual(ownedHa);

        expect(repositoryMock.findOne).toHaveBeenCalledWith({
            where: {
                id: 'owned-ha-id',
            },
        });
    });

    it('should throw NotFoundException when owned HA does not exist', async () => {
        repositoryMock.findOne.mockResolvedValue(null);

        await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });

    it('should create owned HA', async () => {
        const dto = {
            abilityName: 'Flame Body',
            nature: 'Timid',
            breedableValue: 14000000,
            castratedValue: 3500000,
            notes: 'Tenho macho e fêmea breedável.',
            pokemons: [
                {
                    pokemonDexId: 636,
                    pokemonName: 'Larvesta',
                    pokemonSprite: 'sprite-url',
                    isBase: true,
                },
            ],
        };

        const ownedHa = {
            id: 'owned-ha-id',
            ...dto,
        };

        repositoryMock.create.mockReturnValue(ownedHa);
        repositoryMock.save.mockResolvedValue(ownedHa);

        await expect(service.create(dto)).resolves.toEqual(ownedHa);

        expect(repositoryMock.save).toHaveBeenCalledWith(ownedHa);
    });

    it('should update owned HA', async () => {
        const ownedHa = {
            id: 'owned-ha-id',
            abilityName: 'Flame Body',
            nature: 'Timid',
            breedableValue: 14000000,
            castratedValue: 3500000,
            notes: 'Old note.',
            pokemons: [
                {
                    pokemonDexId: 636,
                    pokemonName: 'Larvesta',
                    pokemonSprite: 'sprite-url',
                    isBase: true,
                },
            ],
        };

        const dto = {
            nature: 'Modest',
            notes: 'Updated note.',
        };

        repositoryMock.findOne.mockResolvedValue(ownedHa);
        repositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );

        await expect(service.update('owned-ha-id', dto)).resolves.toEqual({
            ...ownedHa,
            ...dto,
        });

        expect(repositoryMock.save).toHaveBeenCalledWith({
            ...ownedHa,
            ...dto,
        });
    });

    it('should replace pokemons when updating owned HA with pokemons array', async () => {
        const ownedHa = {
            id: 'owned-ha-id',
            abilityName: 'Flame Body',
            nature: 'Timid',
            breedableValue: 14000000,
            castratedValue: 3500000,
            notes: null,
            pokemons: [
                {
                    pokemonDexId: 636,
                    pokemonName: 'Larvesta',
                    pokemonSprite: 'old-sprite-url',
                    isBase: true,
                },
            ],
        };

        const dto = {
            pokemons: [
                {
                    pokemonDexId: 637,
                    pokemonName: 'Volcarona',
                    pokemonSprite: 'new-sprite-url',
                    isBase: false,
                },
            ],
        };

        repositoryMock.findOne.mockResolvedValue(ownedHa);
        repositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );

        const updatedOwnedHa = await service.update('owned-ha-id', dto);

        expect(updatedOwnedHa.pokemons).toHaveLength(1);
        expect(updatedOwnedHa.pokemons[0]).toMatchObject({
            pokemonDexId: 637,
            pokemonName: 'Volcarona',
            pokemonSprite: 'new-sprite-url',
            isBase: false,
        });
    });

    it('should delete owned HA', async () => {
        const ownedHa = {
            id: 'owned-ha-id',
            abilityName: 'Flame Body',
        };

        repositoryMock.findOne.mockResolvedValue(ownedHa);
        repositoryMock.remove.mockResolvedValue(ownedHa);

        await expect(service.remove('owned-ha-id')).resolves.toEqual({
            deleted: true,
        });

        expect(repositoryMock.remove).toHaveBeenCalledWith(ownedHa);
    });
});
