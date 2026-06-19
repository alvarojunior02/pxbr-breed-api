import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';

@Injectable()
export class UsersSeed implements OnApplicationBootstrap {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {}

    async onApplicationBootstrap() {
        const email = this.configService.get<string>('ADMIN_EMAIL');
        const password = this.configService.get<string>('ADMIN_PASSWORD');

        if (!email || !password) {
            return;
        }

        await this.usersService.ensureAdminUser(email, password);
    }
}
