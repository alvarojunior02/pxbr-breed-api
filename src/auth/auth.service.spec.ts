import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;

    const configServiceMock = {
        get: jest.fn(),
    };

    const jwtServiceMock = {
        signAsync: jest.fn(),
        verifyAsync: jest.fn(),
    };

    const usersServiceMock = {
        findByEmail: jest.fn(),
        findById: jest.fn(),
        updateLastLogin: jest.fn(),
        updateRefreshTokenHash: jest.fn(),
        clearRefreshTokenHash: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: ConfigService,
                    useValue: configServiceMock,
                },
                {
                    provide: JwtService,
                    useValue: jwtServiceMock,
                },
                {
                    provide: UsersService,
                    useValue: usersServiceMock,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);

        jest.clearAllMocks();

        configServiceMock.get.mockImplementation((key: string) => {
            const values: Record<string, string> = {
                JWT_ACCESS_SECRET: 'access-secret',
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_SECRET: 'refresh-secret',
                JWT_REFRESH_EXPIRES_IN: '7d',
                JWT_REFRESH_REMEMBER_EXPIRES_IN: '30d',
            };

            return values[key];
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should login successfully', async () => {
        const user = {
            id: 'user-id',
            email: 'admin@pxbr.local',
            passwordHash: 'password-hash',
            role: UserRole.ADMIN,
            isActive: true,
        };

        usersServiceMock.findByEmail.mockResolvedValue(user);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
        jwtServiceMock.signAsync
            .mockResolvedValueOnce('access-token')
            .mockResolvedValueOnce('refresh-token');

        await expect(
            service.login({
                email: user.email,
                password: 'admin-password',
                rememberMe: true,
            }),
        ).resolves.toEqual({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
        });

        expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(user.email);
        expect(usersServiceMock.updateLastLogin).toHaveBeenCalledWith(user.id);
        expect(usersServiceMock.updateRefreshTokenHash).toHaveBeenCalledWith(
            user.id,
            'refresh-token',
        );
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
        usersServiceMock.findByEmail.mockResolvedValue(null);

        await expect(
            service.login({
                email: 'missing@pxbr.local',
                password: 'admin-password',
            }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
        usersServiceMock.findByEmail.mockResolvedValue({
            id: 'user-id',
            email: 'admin@pxbr.local',
            passwordHash: 'password-hash',
            role: UserRole.ADMIN,
            isActive: false,
        });

        await expect(
            service.login({
                email: 'admin@pxbr.local',
                password: 'admin-password',
            }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
        usersServiceMock.findByEmail.mockResolvedValue({
            id: 'user-id',
            email: 'admin@pxbr.local',
            passwordHash: 'password-hash',
            role: UserRole.ADMIN,
            isActive: true,
        });

        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

        await expect(
            service.login({
                email: 'admin@pxbr.local',
                password: 'wrong-password',
            }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should sign access token', async () => {
        jwtServiceMock.signAsync.mockResolvedValue('access-token');

        await expect(
            service.signAccessToken({
                id: 'user-id',
                email: 'admin@pxbr.local',
                role: UserRole.ADMIN,
            }),
        ).resolves.toBe('access-token');

        expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
            {
                sub: 'user-id',
                email: 'admin@pxbr.local',
                role: UserRole.ADMIN,
            },
            {
                secret: 'access-secret',
                expiresIn: '15m',
            },
        );
    });

    it('should sign refresh token with remember me expiration', async () => {
        jwtServiceMock.signAsync.mockResolvedValue('refresh-token');

        await expect(
            service.signRefreshToken(
                {
                    id: 'user-id',
                    email: 'admin@pxbr.local',
                    role: UserRole.ADMIN,
                },
                true,
            ),
        ).resolves.toBe('refresh-token');

        expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
            {
                sub: 'user-id',
                email: 'admin@pxbr.local',
                role: UserRole.ADMIN,
            },
            {
                secret: 'refresh-secret',
                expiresIn: '30d',
            },
        );
    });

    it('should refresh tokens successfully', async () => {
        const user = {
            id: 'user-id',
            email: 'admin@pxbr.local',
            passwordHash: 'password-hash',
            refreshTokenHash: 'refresh-token-hash',
            role: UserRole.ADMIN,
            isActive: true,
        };

        jwtServiceMock.verifyAsync.mockResolvedValue({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        usersServiceMock.findById.mockResolvedValue(user);
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
        jwtServiceMock.signAsync
            .mockResolvedValueOnce('new-access-token')
            .mockResolvedValueOnce('new-refresh-token');

        await expect(service.refresh('old-refresh-token')).resolves.toEqual({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
        });

        expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith(
            'old-refresh-token',
            {
                secret: 'refresh-secret',
            },
        );
        expect(usersServiceMock.findById).toHaveBeenCalledWith(user.id);
        expect(usersServiceMock.updateRefreshTokenHash).toHaveBeenCalledWith(
            user.id,
            'new-refresh-token',
        );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
        jwtServiceMock.verifyAsync.mockRejectedValue(
            new Error('Invalid token'),
        );

        await expect(
            service.refresh('invalid-refresh-token'),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException when refresh token hash does not match', async () => {
        jwtServiceMock.verifyAsync.mockResolvedValue({
            sub: 'user-id',
            email: 'admin@pxbr.local',
            role: UserRole.ADMIN,
        });

        usersServiceMock.findById.mockResolvedValue({
            id: 'user-id',
            email: 'admin@pxbr.local',
            refreshTokenHash: 'refresh-token-hash',
            role: UserRole.ADMIN,
            isActive: true,
        });

        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

        await expect(
            service.refresh('old-refresh-token'),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should logout and clear refresh token hash', async () => {
        usersServiceMock.clearRefreshTokenHash.mockResolvedValue(undefined);

        await expect(service.logout('user-id')).resolves.toBeUndefined();

        expect(usersServiceMock.clearRefreshTokenHash).toHaveBeenCalledWith(
            'user-id',
        );
    });

    it('should ignore logout when user id is not provided', async () => {
        await expect(service.logout()).resolves.toBeUndefined();

        expect(usersServiceMock.clearRefreshTokenHash).not.toHaveBeenCalled();
    });
});
