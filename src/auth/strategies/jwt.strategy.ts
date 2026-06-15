import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey:
                configService.get<string>('JWT_ACCESS_SECRET') || 'change-me-access-secret',
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersService.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('Invalid token.');
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }
}
