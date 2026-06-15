import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

describe('SettingsController', () => {
    let controller: SettingsController;

    const settingsServiceMock = {
        getSettings: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SettingsController],
            providers: [
                {
                    provide: SettingsService,
                    useValue: settingsServiceMock,
                },
            ],
        }).compile();

        controller = module.get<SettingsController>(SettingsController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should get application settings', async () => {
        const settings = {
            id: 'settings-id',
            breedableDefaultValue: 14000000,
            castratedDefaultValue: 3500000,
            backupVersion: 1,
        };

        settingsServiceMock.getSettings.mockResolvedValue(settings);

        await expect(controller.getSettings()).resolves.toEqual(settings);

        expect(settingsServiceMock.getSettings).toHaveBeenCalled();
    });

    it('should update application settings', async () => {
        const dto = {
            breedableDefaultValue: 15000000,
            castratedDefaultValue: 4000000,
        };

        const settings = {
            id: 'settings-id',
            ...dto,
            backupVersion: 1,
        };

        settingsServiceMock.update.mockResolvedValue(settings);

        await expect(controller.update(dto)).resolves.toEqual(settings);

        expect(settingsServiceMock.update).toHaveBeenCalledWith(dto);
    });
});
