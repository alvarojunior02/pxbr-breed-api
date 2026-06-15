import { Test, TestingModule } from '@nestjs/testing';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';

describe('BackupController', () => {
    let controller: BackupController;

    const backupServiceMock = {
        exportBackup: jest.fn(),
        importBackup: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BackupController],
            providers: [
                {
                    provide: BackupService,
                    useValue: backupServiceMock,
                },
            ],
        }).compile();

        controller = module.get<BackupController>(BackupController);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should export backup', async () => {
        const backup = {
            exportedAt: '2026-06-15T00:00:00.000Z',
            version: 1,
            data: {
                players: [],
                orders: [],
                transactions: [],
                orderStatusHistory: [],
                ownedPokemons: [],
                ownedHas: [],
            },
        };

        backupServiceMock.exportBackup.mockResolvedValue(backup);

        await expect(controller.exportBackup()).resolves.toEqual(backup);

        expect(backupServiceMock.exportBackup).toHaveBeenCalled();
    });

    it('should import backup incrementally', async () => {
        const dto = {
            data: {
                players: [
                    {
                        id: 'player-id',
                        nick: 'EKNight008',
                    },
                ],
                orders: [],
                transactions: [],
                orderStatusHistory: [],
                ownedPokemons: [],
                ownedHas: [],
            },
        };

        const result = {
            success: true,
            mode: 'incremental',
            importedAt: '2026-06-15T00:00:00.000Z',
            summary: {
                players: {
                    imported: 1,
                    skipped: 0,
                },
                orders: {
                    imported: 0,
                    skipped: 0,
                },
                transactions: {
                    imported: 0,
                    skipped: 0,
                },
                orderStatusHistory: {
                    imported: 0,
                    skipped: 0,
                },
                ownedPokemons: {
                    imported: 0,
                    skipped: 0,
                },
                ownedHas: {
                    imported: 0,
                    skipped: 0,
                },
            },
        };

        backupServiceMock.importBackup.mockResolvedValue(result);

        await expect(controller.importBackup(dto)).resolves.toEqual(result);

        expect(backupServiceMock.importBackup).toHaveBeenCalledWith(dto);
    });
});
