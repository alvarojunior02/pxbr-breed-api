import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Player } from './entities/player.entity';
import { PlayersService } from './players.service';

describe('PlayersService', () => {
    let service: PlayersService;

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
                PlayersService,
                {
                    provide: getRepositoryToken(Player),
                    useValue: repositoryMock,
                },
            ],
        }).compile();

        service = module.get<PlayersService>(PlayersService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should list players', async () => {
        const players = [
            {
                id: 'player-id',
                nick: 'EKNight008',
                notes: null,
            },
        ];

        repositoryMock.find.mockResolvedValue(players);

        await expect(service.findAll()).resolves.toEqual(players);

        expect(repositoryMock.find).toHaveBeenCalledWith({
            order: {
                createdAt: 'DESC',
            },
        });
    });

    it('should list players filtered by search', async () => {
        const players = [
            {
                id: 'player-id',
                nick: 'EKNight008',
                notes: null,
            },
        ];

        repositoryMock.find.mockResolvedValue(players);

        await expect(service.findAll('Knight')).resolves.toEqual(players);

        expect(repositoryMock.find).toHaveBeenCalledWith({
            where: {
                nick: expect.anything(),
            },
            order: {
                createdAt: 'DESC',
            },
        });
    });

    it('should get player by id', async () => {
        const player = {
            id: 'player-id',
            nick: 'EKNight008',
            notes: null,
        };

        repositoryMock.findOne.mockResolvedValue(player);

        await expect(service.findOne('player-id')).resolves.toEqual(player);

        expect(repositoryMock.findOne).toHaveBeenCalledWith({
            where: {
                id: 'player-id',
            },
        });
    });

    it('should throw NotFoundException when player does not exist', async () => {
        repositoryMock.findOne.mockResolvedValue(null);

        await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });

    it('should create player', async () => {
        const dto = {
            nick: 'EKNight008',
            notes: 'Cliente recorrente.',
        };

        const player = {
            id: 'player-id',
            ...dto,
        };

        repositoryMock.findOne.mockResolvedValue(null);
        repositoryMock.create.mockReturnValue(player);
        repositoryMock.save.mockResolvedValue(player);

        await expect(service.create(dto)).resolves.toEqual(player);

        expect(repositoryMock.findOne).toHaveBeenCalledWith({
            where: {
                nick: dto.nick,
            },
        });
        expect(repositoryMock.create).toHaveBeenCalledWith({
            nick: dto.nick,
            notes: dto.notes,
        });
        expect(repositoryMock.save).toHaveBeenCalledWith(player);
    });

    it('should create player with null notes when notes is not provided', async () => {
        const dto = {
            nick: 'EKNight008',
        };

        const player = {
            id: 'player-id',
            nick: dto.nick,
            notes: null,
        };

        repositoryMock.findOne.mockResolvedValue(null);
        repositoryMock.create.mockReturnValue(player);
        repositoryMock.save.mockResolvedValue(player);

        await expect(service.create(dto)).resolves.toEqual(player);

        expect(repositoryMock.create).toHaveBeenCalledWith({
            nick: dto.nick,
            notes: null,
        });
    });

    it('should throw ConflictException when creating player with registered nick', async () => {
        repositoryMock.findOne.mockResolvedValue({
            id: 'existing-player-id',
            nick: 'EKNight008',
        });

        await expect(
            service.create({
                nick: 'EKNight008',
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should update player', async () => {
        const player = {
            id: 'player-id',
            nick: 'EKNight008',
            notes: 'Old note.',
        };

        const dto = {
            nick: 'Knight008',
            notes: 'New note.',
        };

        repositoryMock.findOne
            .mockResolvedValueOnce(player)
            .mockResolvedValueOnce(null);

        repositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );

        await expect(service.update('player-id', dto)).resolves.toEqual({
            ...player,
            ...dto,
        });

        expect(repositoryMock.findOne).toHaveBeenNthCalledWith(1, {
            where: {
                id: 'player-id',
            },
        });
        expect(repositoryMock.findOne).toHaveBeenNthCalledWith(2, {
            where: {
                nick: dto.nick,
            },
        });
        expect(repositoryMock.save).toHaveBeenCalledWith({
            ...player,
            ...dto,
        });
    });

    it('should keep current notes when updating without notes', async () => {
        const player = {
            id: 'player-id',
            nick: 'EKNight008',
            notes: 'Old note.',
        };

        const dto = {
            nick: 'EKNight008',
        };

        repositoryMock.findOne.mockResolvedValue(player);
        repositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );

        await expect(service.update('player-id', dto)).resolves.toEqual({
            ...player,
            ...dto,
            notes: player.notes,
        });

        expect(repositoryMock.save).toHaveBeenCalledWith({
            ...player,
            ...dto,
            notes: player.notes,
        });
    });

    it('should delete player', async () => {
        const player = {
            id: 'player-id',
            nick: 'EKNight008',
            notes: null,
        };

        repositoryMock.findOne.mockResolvedValue(player);
        repositoryMock.remove.mockResolvedValue(player);

        await expect(service.remove('player-id')).resolves.toEqual({
            deleted: true,
        });

        expect(repositoryMock.remove).toHaveBeenCalledWith(player);
    });
});
