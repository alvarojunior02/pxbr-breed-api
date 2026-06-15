import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthUser } from './types/auth-user.type';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.authService.login(loginDto);

        response.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: loginDto.rememberMe
                ? 1000 * 60 * 60 * 24 * 30
                : 1000 * 60 * 60 * 24 * 7,
        });

        return {
            user: result.user,
            accessToken: result.accessToken,
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
