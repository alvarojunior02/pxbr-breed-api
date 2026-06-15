import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Settings } from './entities/settings.entity';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;

    const repositoryMock = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SettingsService,
                {
                    provide: getRepositoryToken(Settings),
                    useValue: repositoryMock,
                },
            ],
        }).compile();

        service = module.get<SettingsService>(SettingsService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return existing settings', async () => {
        const settings = {
            id: 'settings-id',
            breedableDefaultValue: 14000000,
            castratedDefaultValue: 3500000,
            backupVersion: 1,
        };

        repositoryMock.findOne.mockResolvedValue(settings);

        await expect(service.getSettings()).resolves.toEqual(settings);

        expect(repositoryMock.findOne).toHaveBeenCalledWith({
            where: {},
            order: {
                createdAt: 'ASC',
            },
        });
        expect(repositoryMock.create).not.toHaveBeenCalled();
        expect(repositoryMock.save).not.toHaveBeenCalled();
    });

    it('should create default settings when settings do not exist', async () => {
        const settings = {
            id: 'settings-id',
            breedableDefaultValue: 14000000,
            castratedDefaultValue: 3500000,
            backupVersion: 1,
        };

        repositoryMock.findOne.mockResolvedValue(null);
        repositoryMock.create.mockReturnValue(settings);
        repositoryMock.save.mockResolvedValue(settings);

        await expect(service.getSettings()).resolves.toEqual(settings);

        expect(repositoryMock.create).toHaveBeenCalledWith({
            breedableDefaultValue: 14000000,
            castratedDefaultValue: 3500000,
            backupVersion: 1,
        });
        expect(repositoryMock.save).toHaveBeenCalledWith(settings);
    });

    it('should update settings', async () => {
        const settings = {
            id: 'settings-id',
            breedableDefaultValue: 14000000,
            castratedDefaultValue: 3500000,
            backupVersion: 1,
        };

        const dto = {
            breedableDefaultValue: 15000000,
            castratedDefaultValue: 4000000,
        };

        repositoryMock.findOne.mockResolvedValue(settings);
        repositoryMock.save.mockImplementation((value) =>
            Promise.resolve(value),
        );

        await expect(service.update(dto)).resolves.toEqual({
            ...settings,
            ...dto,
        });

        expect(repositoryMock.save).toHaveBeenCalledWith({
            ...settings,
            ...dto,
        });
    });
});
