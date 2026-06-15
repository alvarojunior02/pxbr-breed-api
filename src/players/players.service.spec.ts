import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Player } from './entities/player.entity';
import { PlayersService } from './players.service';

describe('PlayersService', () => {
    let service: PlayersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayersService,
                {
                    provide: getRepositoryToken(Player),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PlayersService>(PlayersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
