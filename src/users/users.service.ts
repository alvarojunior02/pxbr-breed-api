import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    findByEmail(email: string) {
        return this.usersRepository.findOne({
            where: {
                email: email.trim().toLowerCase(),
            },
        });
    }

    findById(id: string) {
        return this.usersRepository.findOne({
            where: {
                id,
                isActive: true,
            },
        });
    }

    async createAdmin(email: string, password: string) {
        const user = this.usersRepository.create({
            email,
            passwordHash: await bcrypt.hash(password, 12),
            role: UserRole.ADMIN,
            isActive: true,
        });

        return this.usersRepository.save(user);
    }

    async ensureAdminUser(email: string, password: string) {
        const existingUser = await this.findByEmail(email);

        if (existingUser) {
            return existingUser;
        }

        return this.createAdmin(email, password);
    }

    async updateLastLogin(userId: string) {
        await this.usersRepository.update(userId, {
            lastLoginAt: new Date(),
        });
    }
}
