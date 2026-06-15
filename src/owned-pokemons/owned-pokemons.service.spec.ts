import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OwnedPokemon } from './entities/owned-pokemon.entity';
import { OwnedPokemonsService } from './owned-pokemons.service';

describe('OwnedPokemonsService', () => {
    let service: OwnedPokemonsService;

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
                OwnedPokemonsService,
                {
                    provide: getRepositoryToken(OwnedPokemon),
                    useValue: repositoryMock,
                },
            ],
        }).compile();

        service = module.get<OwnedPokemonsService>(OwnedPokemonsService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should list owned Pokémons', async () => {
        const ownedPokemons = [
            {
                id: 'owned-pokemon-id',
                pokemonDexId: 636,
                pokemonName: 'Larvesta',
                status: 'F5 PFT',
                gender: 'Fêmea',
                nature: 'Timid',
            },
        ];

        repositoryMock.find.mockResolvedValue(ownedPokemons);

        await expect(service.findAll({})).resolves.toEqual(ownedPokemons);

        expect(repositoryMock.find).toHaveBeenCalledWith({
            order: {
                createdAt: 'DESC',
            },
        });
    });

    it('should filter owned Pokémons by search', async () => {
        const ownedPokemons = [
            {
                id: 'larvesta-id',
                pokemonDexId: 636,
                pokemonName: 'Larvesta',
                status: 'F5 PFT',
                gender: 'Fêmea',
                nature: 'Timid',
                notes: 'Serve para time de Sol.',
            },
            {
                id: 'ditto-id',
                pokemonDexId: 132,
                pokemonName: 'Ditto',
                status: 'F6',
                gender: 'Genderless',
                nature: null,
                notes: null,
            },
        ];

        repositoryMock.find.mockResolvedValue(ownedPokemons);

        await expect(service.findAll({ search: 'sol' })).resolves.toEqual([
            ownedPokemons[0],
        ]);
    });

    it('should get owned Pokémon by id', async () => {
        const ownedPokemon = {
            id: 'owned-pokemon-id',
            pokemonDexId: 636,
            pokemonName: 'Larvesta',
        };

        repositoryMock.findOne.mockResolvedValue(ownedPokemon);

        await expect(service.findOne('owned-pokemon-id')).resolves.toEqual(
            ownedPokemon,
        );

        expect(repositoryMock.findOne).toHaveBeenCalledWith({
            where: {
                id: 'owned-pokemon-id',
            },
        });
    });

    it('should throw NotFoundException when owned Pokémon does not exist', async () => {
        repositoryMock.findOne.mockResolvedValue(null);

        await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });

    it('should create owned Pokémon', async () => {
        const dto = {
            pokemonDexId: 636,
            pokemonName: 'Larvesta',
            pokemonSprite: 'sprite-url',
            breedBaseDexId: 636,
            breedBaseName: 'Larvesta',
            status: 'F5 PFT',
            gender: 'Fêmea',
            nature: 'Timid',
            notes: 'Serve para time de Sol.',
        };

        const ownedPokemon = {
            id: 'owned-pokemon-id',
            ...dto,
        };

        repositoryMock.create.mockReturnValue(ownedPokemon);
        repositoryMock.save.mockResolvedValue(ownedPokemon);

        await expect(service.create(dto)).resolves.toEqual(ownedPokemon);

        expect(repositoryMock.create).toHaveBeenCalledWith(dto);
        expect(repositoryMock.save).toHaveBeenCalledWith(ownedPokemon);
    });

    it('should update owned Pokémon', async () => {
        const ownedPokemon = {
            id: 'owned-pokemon-id',
            pokemonDexId: 636,
            pokemonName: 'Larvesta',
            pokemonSprite: 'old-sprite',
            breedBaseDexId: 636,
            breedBaseName: 'Larvesta',
            status: 'F5 PFT',
            gender: 'Fêmea',
            nature: 'Timid',
            notes: 'Old note.',
        };

        const dto = {
            status: 'F6',
            notes: 'Updated note.',
        };

        repositoryMock.findOne.mockResolvedValue(ownedPokemon);
        repositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );

        await expect(service.update('owned-pokemon-id', dto)).resolves.toEqual({
            ...ownedPokemon,
            ...dto,
        });

        expect(repositoryMock.save).toHaveBeenCalledWith({
            ...ownedPokemon,
            ...dto,
        });
    });

    it('should delete owned Pokémon', async () => {
        const ownedPokemon = {
            id: 'owned-pokemon-id',
            pokemonDexId: 636,
            pokemonName: 'Larvesta',
        };

        repositoryMock.findOne.mockResolvedValue(ownedPokemon);
        repositoryMock.remove.mockResolvedValue(ownedPokemon);

        await expect(service.remove('owned-pokemon-id')).resolves.toEqual({
            deleted: true,
        });

        expect(repositoryMock.remove).toHaveBeenCalledWith(ownedPokemon);
    });
});
