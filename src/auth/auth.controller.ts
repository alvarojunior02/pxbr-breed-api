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
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthUser } from './types/auth-user.type';
import { getRefreshTokenFromRequest } from './utils/cookies';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
        const result = await this.authService.login(loginDto);

        response.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: loginDto.rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24 * 7,
        });

        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }

    @Post('refresh')
    async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = getRefreshTokenFromRequest(request);

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found.');
        }

        const result = await this.authService.refresh(refreshToken);

        response.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        return {
            user: result.user,
            accessToken: result.accessToken,
        };
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
        });

        return {
            success: true,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@CurrentUser() user: AuthUser) {
        return {
            user,
        };
    }
}
