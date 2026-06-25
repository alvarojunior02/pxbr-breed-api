import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { UserRole } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;

    const authServiceMock = {
        login: jest.fn(),
        refresh: jest.fn(),
        logout: jest.fn(),
    };

    const configServiceMock = {
        get: jest.fn(),
    };

    const responseMock = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: authServiceMock,
                },
                {
                    provide: ConfigService,
                    useValue: configServiceMock,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);

        jest.clearAllMocks();

        configServiceMock.get.mockImplementation((key: string) => {
            if (key === 'APP_ENV') {
                return 'development';
            }

            return undefined;
        });
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should login and set refresh token cookie', async () => {
        const loginDto = {
            email: 'admin@pxbr.local',
            password: 'admin-password',
            rememberMe: true,
        };

        const result = {
            user: {
                id: 'user-id',
                email: loginDto.email,
                role: UserRole.ADMIN,
            },
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
        };

        authServiceMock.login.mockResolvedValue(result);

        await expect(controller.login(loginDto, responseMock)).resolves.toEqual({
            user: result.user,
            accessToken: result.accessToken,
        });

        expect(authServiceMock.login).toHaveBeenCalledWith(loginDto);
        expect(responseMock.cookie).toHaveBeenCalledWith('refreshToken', result.refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 30,
        });
    });

    it('should set production refresh token cookie options on login', async () => {
        configServiceMock.get.mockImplementation((key: string) => {
            if (key === 'APP_ENV') {
                return 'production';
            }

            return undefined;
        });

        const loginDto = {
            email: 'admin@pxbr.local',
            password: 'admin-password',
            rememberMe: false,
        };

        const result = {
            user: {
                id: 'user-id',
                email: loginDto.email,
                role: UserRole.ADMIN,
            },
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
        };

        authServiceMock.login.mockResolvedValue(result);

        await controller.login(loginDto, responseMock);

        expect(responseMock.cookie).toHaveBeenCalledWith('refreshToken', result.refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
    });

    it('should refresh token using refresh token cookie', async () => {
        const requestMock = {
            cookies: {
                refreshToken: 'old-refresh-token',
            },
        } as unknown as Request;

        const result = {
            user: {
                id: 'user-id',
                email: 'admin@pxbr.local',
                role: UserRole.ADMIN,
            },
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
        };

        authServiceMock.refresh.mockResolvedValue(result);

        await expect(controller.refresh(requestMock, responseMock)).resolves.toEqual({
            user: result.user,
            accessToken: result.accessToken,
        });

        expect(authServiceMock.refresh).toHaveBeenCalledWith('old-refresh-token');
        expect(responseMock.cookie).toHaveBeenCalledWith('refreshToken', result.refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
    });

    it('should throw UnauthorizedException when refresh token cookie is missing', async () => {
        const requestMock = {
            cookies: {},
        } as unknown as Request;

        await expect(controller.refresh(requestMock, responseMock)).rejects.toBeInstanceOf(
            UnauthorizedException,
        );

        expect(authServiceMock.refresh).not.toHaveBeenCalled();
    });

    it('should logout and clear refresh token cookie', async () => {
        const requestMock = {
            cookies: {
                refreshToken: 'refresh-token',
            },
        } as unknown as Request;

        authServiceMock.refresh.mockResolvedValue({
            user: {
                id: 'user-id',
                email: 'admin@pxbr.local',
                role: UserRole.ADMIN,
            },
            accessToken: 'access-token',
            refreshToken: 'new-refresh-token',
        });

        authServiceMock.logout.mockResolvedValue(undefined);

        await expect(controller.logout(requestMock, responseMock)).resolves.toEqual({
            success: true,
        });

        expect(authServiceMock.refresh).toHaveBeenCalledWith('refresh-token');
        expect(authServiceMock.logout).toHaveBeenCalledWith('user-id');
        expect(responseMock.clearCookie).toHaveBeenCalledWith('refreshToken', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
        });
    });

    it('should clear production refresh token cookie on logout', async () => {
        configServiceMock.get.mockImplementation((key: string) => {
            if (key === 'APP_ENV') {
                return 'production';
            }

            return undefined;
        });

        const requestMock = {
            cookies: {},
        } as unknown as Request;

        await controller.logout(requestMock, responseMock);

        expect(responseMock.clearCookie).toHaveBeenCalledWith('refreshToken', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
        });
    });

    it('should clear refresh token cookie even when logout refresh fails', async () => {
        const requestMock = {
            cookies: {
                refreshToken: 'invalid-refresh-token',
            },
        } as unknown as Request;

        authServiceMock.refresh.mockRejectedValue(new UnauthorizedException());

        await expect(controller.logout(requestMock, responseMock)).resolves.toEqual({
            success: true,
        });

        expect(authServiceMock.logout).not.toHaveBeenCalled();
        expect(responseMock.clearCookie).toHaveBeenCalledWith('refreshToken', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
        });
    });

    it('should return authenticated user', () => {
        const user = {
            id: 'user-id',
            email: 'admin@pxbr.local',
            role: UserRole.ADMIN,
        };

        expect(controller.getMe(user)).toEqual({
            user,
        });
    });
});
