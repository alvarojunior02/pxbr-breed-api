import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
    let service: UsersService;

    const repositoryMock = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: repositoryMock,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should find user by email', async () => {
        const user = {
            id: 'user-id',
            email: 'admin@pxbr.local',
            role: 'ADMIN',
        };

        repositoryMock.findOne.mockResolvedValue(user);

        await expect(service.findByEmail('admin@pxbr.local')).resolves.toEqual(user);

        expect(repositoryMock.findOne).toHaveBeenCalledWith({
            where: {
                email: 'admin@pxbr.local',
            },
        });
    });

    it('should find active user by id', async () => {
        const user = {
            id: 'user-id',
            email: 'admin@pxbr.local',
            role: 'ADMIN',
            isActive: true,
        };

        repositoryMock.findOne.mockResolvedValue(user);

        await expect(service.findById('user-id')).resolves.toEqual(user);

        expect(repositoryMock.findOne).toHaveBeenCalledWith({
            where: {
                id: 'user-id',
                isActive: true,
            },
        });
    });

    it('should create admin user when admin does not exist', async () => {
        const createdUser = {
            id: 'user-id',
            email: 'admin@pxbr.local',
            passwordHash: 'hashed-password',
            role: 'ADMIN',
            isActive: true,
        };

        repositoryMock.findOne.mockResolvedValue(null);
        repositoryMock.create.mockReturnValue(createdUser);
        repositoryMock.save.mockResolvedValue(createdUser);

        await expect(
            service.ensureAdminUser('admin@pxbr.local', 'admin-password'),
        ).resolves.toEqual(createdUser);

        expect(repositoryMock.create).toHaveBeenCalledWith({
            email: 'admin@pxbr.local',
            passwordHash: expect.any(String),
            role: 'ADMIN',
            isActive: true,
        });
        expect(repositoryMock.save).toHaveBeenCalledWith(createdUser);
    });

    it('should return existing admin user when admin already exists', async () => {
        const existingUser = {
            id: 'user-id',
            email: 'admin@pxbr.local',
            passwordHash: 'hashed-password',
            role: 'ADMIN',
        };

        repositoryMock.findOne.mockResolvedValue(existingUser);

        await expect(
            service.ensureAdminUser('admin@pxbr.local', 'hashed-password'),
        ).resolves.toEqual(existingUser);

        expect(repositoryMock.create).not.toHaveBeenCalled();
        expect(repositoryMock.save).not.toHaveBeenCalled();
    });

    it('should update last login', async () => {
        repositoryMock.update.mockResolvedValue({
            affected: 1,
        });

        await expect(service.updateLastLogin('user-id')).resolves.toBeUndefined();

        expect(repositoryMock.update).toHaveBeenCalledWith('user-id', {
            lastLoginAt: expect.any(Date),
        });
    });

    it('should update refresh token hash', async () => {
        repositoryMock.update.mockResolvedValue({
            affected: 1,
        });

        await expect(
            service.updateRefreshTokenHash('user-id', 'refresh-token'),
        ).resolves.toBeUndefined();

        expect(repositoryMock.update).toHaveBeenCalledWith('user-id', {
            refreshTokenHash: expect.any(String),
        });
    });

    it('should clear refresh token hash', async () => {
        repositoryMock.update.mockResolvedValue({
            affected: 1,
        });

        await expect(service.clearRefreshTokenHash('user-id')).resolves.toBeUndefined();

        expect(repositoryMock.update).toHaveBeenCalledWith('user-id', {
            refreshTokenHash: undefined,
        });
    });
});
