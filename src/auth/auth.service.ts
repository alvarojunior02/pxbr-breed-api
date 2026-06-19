import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from './types/auth-user.type';
import { JwtPayload } from './types/jwt-payload.type';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) {}

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        const passwordMatches = await bcrypt.compare(loginDto.password, user.passwordHash);

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        await this.usersService.updateLastLogin(user.id);

        const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = await this.signAccessToken(authUser);
        const refreshToken = await this.signRefreshToken(authUser, Boolean(loginDto.rememberMe));

        await this.usersService.updateRefreshTokenHash(user.id, refreshToken);

        return {
            user: authUser,
            accessToken,
            refreshToken,
        };
    }

    async signAccessToken(user: AuthUser) {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ||
                '15m') as StringValue,
        });
    }

    async signRefreshToken(user: AuthUser, rememberMe = false) {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const expiresIn = rememberMe
            ? this.configService.get<string>('JWT_REFRESH_REMEMBER_EXPIRES_IN') || '30d'
            : this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

        return this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: expiresIn as StringValue,
        });
    }

    // REFRESH AUTH TOKENS
    async refresh(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            const user = await this.usersService.findById(payload.sub);

            if (!user?.refreshTokenHash) {
                throw new UnauthorizedException('Invalid refresh token.');
            }

            const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);

            if (!refreshTokenMatches) {
                throw new UnauthorizedException('Invalid refresh token.');
            }

            if (!user || !user.isActive) {
                throw new UnauthorizedException('Invalid refresh token.');
            }

            const authUser: AuthUser = {
                id: user.id,
                email: user.email,
                role: user.role,
            };

            const accessToken = await this.signAccessToken(authUser);
            const newRefreshToken = await this.signRefreshToken(authUser);

            await this.usersService.updateRefreshTokenHash(user.id, newRefreshToken);

            return {
                user: authUser,
                accessToken,
                refreshToken: newRefreshToken,
            };
        } catch {
            throw new UnauthorizedException('Invalid refresh token.');
        }
    }

    // LOGOUT USER
    async logout(userId?: string) {
        if (!userId) {
            return;
        }

        await this.usersService.clearRefreshTokenHash(userId);
    }
}
