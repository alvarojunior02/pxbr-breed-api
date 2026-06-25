import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    ApiBearerAuth,
    ApiCookieAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthUser } from './types/auth-user.type';
import { getRefreshTokenFromRequest } from './utils/cookies';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    private isProduction(): boolean {
        return this.configService.get<string>('APP_ENV') === 'production';
    }

    private getRefreshTokenCookieOptions(maxAge?: number): CookieOptions {
        const isProduction = this.isProduction();

        return {
            httpOnly: true,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction,
            path: '/',
            ...(maxAge ? { maxAge } : {}),
        };
    }

    @ApiOperation({ summary: 'Login with email and password' })
    @ApiOkResponse({
        description: 'Returns authenticated user and access token.',
    })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
        const result = await this.authService.login(loginDto);

        response.cookie(
            'refreshToken',
            result.refreshToken,
            this.getRefreshTokenCookieOptions(
                loginDto.rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24 * 7,
            ),
        );

        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }

    @ApiCookieAuth('refreshToken')
    @ApiOperation({
        summary: 'Refresh access token using refresh token cookie',
    })
    @ApiOkResponse({
        description: 'Returns a new access token and rotates refresh token.',
    })
    @ApiUnauthorizedResponse({ description: 'Invalid refresh token.' })
    @Post('refresh')
    async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = getRefreshTokenFromRequest(request);

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found.');
        }

        const result = await this.authService.refresh(refreshToken);

        response.cookie(
            'refreshToken',
            result.refreshToken,
            this.getRefreshTokenCookieOptions(1000 * 60 * 60 * 24 * 7),
        );

        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }

    @ApiCookieAuth('refreshToken')
    @ApiOperation({ summary: 'Logout and clear refresh token cookie' })
    @ApiOkResponse({ description: 'Clears refresh token cookie.' })
    @Post('logout')
    async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = getRefreshTokenFromRequest(request);

        if (refreshToken) {
            try {
                const result = await this.authService.refresh(refreshToken);

                await this.authService.logout(result.user.id);
            } catch {
                // Ignore invalid refresh tokens during logout.
            }
        }

        response.clearCookie('refreshToken', this.getRefreshTokenCookieOptions());

        return {
            success: true,
        };
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get authenticated user' })
    @ApiOkResponse({ description: 'Returns authenticated user.' })
    @ApiUnauthorizedResponse({
        description: 'Invalid or missing access token.',
    })
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@CurrentUser() user: AuthUser) {
        return {
            user,
        };
    }
}
