import { Test, TestingModule } from '@nestjs/testing';
import { OwnedPokemonsController } from './owned-pokemons.controller';
import { OwnedPokemonsService } from './owned-pokemons.service';

describe('OwnedPokemonsController', () => {
    let controller: OwnedPokemonsController;

    const ownedPokemonsServiceMock = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OwnedPokemonsController],
            providers: [
                {
                    provide: OwnedPokemonsService,
                    useValue: ownedPokemonsServiceMock,
                },
            ],
        }).compile();

        controller = module.get<OwnedPokemonsController>(
            OwnedPokemonsController,
        );

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should list owned Pokémons', async () => {
        const query = {
            search: 'Larvesta',
        };

        const ownedPokemons = [
            {
                id: 'owned-pokemon-id',
                pokemonDexId: 636,
                pokemonName: 'Larvesta',
                status: 'F5 PFT',
                gender: 'Fêmea',
            },
        ];

        ownedPokemonsServiceMock.findAll.mockResolvedValue(ownedPokemons);

        await expect(controller.findAll(query)).resolves.toEqual(ownedPokemons);

        expect(ownedPokemonsServiceMock.findAll).toHaveBeenCalledWith(query);
    });

    it('should get owned Pokémon by id', async () => {
        const ownedPokemon = {
            id: 'owned-pokemon-id',
            pokemonDexId: 636,
            pokemonName: 'Larvesta',
        };

        ownedPokemonsServiceMock.findOne.mockResolvedValue(ownedPokemon);

        await expect(controller.findOne('owned-pokemon-id')).resolves.toEqual(
            ownedPokemon,
        );

        expect(ownedPokemonsServiceMock.findOne).toHaveBeenCalledWith(
            'owned-pokemon-id',
        );
    });

    it('should create owned Pokémon', async () => {
        const dto = {
            pokemonDexId: 636,
            pokemonName: 'Larvesta',
            status: 'F5 PFT',
            gender: 'Fêmea',
            nature: 'Timid',
        };

        const ownedPokemon = {
            id: 'owned-pokemon-id',
            ...dto,
        };

        ownedPokemonsServiceMock.create.mockResolvedValue(ownedPokemon);

        await expect(controller.create(dto)).resolves.toEqual(ownedPokemon);

        expect(ownedPokemonsServiceMock.create).toHaveBeenCalledWith(dto);
    });

    it('should update owned Pokémon', async () => {
        const dto = {
            status: 'F6',
            notes: 'Atualizado para breed futuro.',
        };

        const ownedPokemon = {
            id: 'owned-pokemon-id',
            pokemonDexId: 636,
            pokemonName: 'Larvesta',
            ...dto,
        };

        ownedPokemonsServiceMock.update.mockResolvedValue(ownedPokemon);

        await expect(
            controller.update('owned-pokemon-id', dto),
        ).resolves.toEqual(ownedPokemon);

        expect(ownedPokemonsServiceMock.update).toHaveBeenCalledWith(
            'owned-pokemon-id',
            dto,
        );
    });

    it('should delete owned Pokémon', async () => {
        ownedPokemonsServiceMock.remove.mockResolvedValue({
            deleted: true,
        });

        await expect(controller.remove('owned-pokemon-id')).resolves.toEqual({
            deleted: true,
        });

        expect(ownedPokemonsServiceMock.remove).toHaveBeenCalledWith(
            'owned-pokemon-id',
        );
    });
});
