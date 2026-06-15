import { Test, TestingModule } from '@nestjs/testing';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

describe('PlayersController', () => {
    let controller: PlayersController;

    const playersServiceMock = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PlayersController],
            providers: [
                {
                    provide: PlayersService,
                    useValue: playersServiceMock,
                },
            ],
        }).compile();

        controller = module.get<PlayersController>(PlayersController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should list players', async () => {
        const players = [
            {
                id: 'player-id',
                nick: 'EKNight008',
            },
        ];

        playersServiceMock.findAll.mockResolvedValue(players);

        await expect(controller.findAll()).resolves.toEqual(players);

        expect(playersServiceMock.findAll).toHaveBeenCalled();
    });

    it('should get player by id', async () => {
        const player = {
            id: 'player-id',
            nick: 'EKNight008',
        };

        playersServiceMock.findOne.mockResolvedValue(player);

        await expect(controller.findOne('player-id')).resolves.toEqual(player);

        expect(playersServiceMock.findOne).toHaveBeenCalledWith('player-id');
    });

    it('should create player', async () => {
        const dto = {
            nick: 'EKNight008',
            avatarUrl: 'avatar-url',
        };

        const player = {
            id: 'player-id',
            ...dto,
        };

        playersServiceMock.create.mockResolvedValue(player);

        await expect(controller.create(dto)).resolves.toEqual(player);

        expect(playersServiceMock.create).toHaveBeenCalledWith(dto);
    });

    it('should update player', async () => {
        const dto = {
            nick: 'Knight008',
        };

        const player = {
            id: 'player-id',
            nick: 'Knight008',
        };

        playersServiceMock.update.mockResolvedValue(player);

        await expect(controller.update('player-id', dto)).resolves.toEqual(
            player,
        );

        expect(playersServiceMock.update).toHaveBeenCalledWith(
            'player-id',
            dto,
        );
    });

    it('should delete player', async () => {
        playersServiceMock.remove.mockResolvedValue({
            deleted: true,
        });

        await expect(controller.remove('player-id')).resolves.toEqual({
            deleted: true,
        });

        expect(playersServiceMock.remove).toHaveBeenCalledWith('player-id');
    });
});
