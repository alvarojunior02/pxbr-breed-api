import { Test, TestingModule } from '@nestjs/testing';
import { OwnedHasController } from './owned-has.controller';
import { OwnedHasService } from './owned-has.service';

describe('OwnedHasController', () => {
    let controller: OwnedHasController;

    const ownedHasServiceMock = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OwnedHasController],
            providers: [
                {
                    provide: OwnedHasService,
                    useValue: ownedHasServiceMock,
                },
            ],
        }).compile();

        controller = module.get<OwnedHasController>(OwnedHasController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should list owned HAs', async () => {
        const query = {
            search: 'Flame Body',
        };

        const ownedHas = [
            {
                id: 'owned-ha-id',
                abilityName: 'Flame Body',
                nature: 'Timid',
                breedableValue: 14000000,
                castratedValue: 3500000,
            },
        ];

        ownedHasServiceMock.findAll.mockResolvedValue(ownedHas);

        await expect(controller.findAll(query)).resolves.toEqual(ownedHas);

        expect(ownedHasServiceMock.findAll).toHaveBeenCalledWith(query);
    });

    it('should get owned HA by id', async () => {
        const ownedHa = {
            id: 'owned-ha-id',
            abilityName: 'Flame Body',
        };

        ownedHasServiceMock.findOne.mockResolvedValue(ownedHa);

        await expect(controller.findOne('owned-ha-id')).resolves.toEqual(
            ownedHa,
        );

        expect(ownedHasServiceMock.findOne).toHaveBeenCalledWith('owned-ha-id');
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

        ownedHasServiceMock.create.mockResolvedValue(ownedHa);

        await expect(controller.create(dto)).resolves.toEqual(ownedHa);

        expect(ownedHasServiceMock.create).toHaveBeenCalledWith(dto);
    });

    it('should update owned HA', async () => {
        const dto = {
            nature: 'Modest',
            notes: 'Atualizado via API.',
        };

        const ownedHa = {
            id: 'owned-ha-id',
            abilityName: 'Flame Body',
            ...dto,
        };

        ownedHasServiceMock.update.mockResolvedValue(ownedHa);

        await expect(controller.update('owned-ha-id', dto)).resolves.toEqual(
            ownedHa,
        );

        expect(ownedHasServiceMock.update).toHaveBeenCalledWith(
            'owned-ha-id',
            dto,
        );
    });

    it('should delete owned HA', async () => {
        ownedHasServiceMock.remove.mockResolvedValue({
            deleted: true,
        });

        await expect(controller.remove('owned-ha-id')).resolves.toEqual({
            deleted: true,
        });

        expect(ownedHasServiceMock.remove).toHaveBeenCalledWith('owned-ha-id');
    });
});
