import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Player } from './entities/player.entity';

@Injectable()
export class PlayersService {
    constructor(
        @InjectRepository(Player)
        private readonly playersRepository: Repository<Player>,
    ) {}

    findAll(search?: string) {
        if (!search) {
            return this.playersRepository.find({
                order: {
                    createdAt: 'DESC',
                },
            });
        }

        return this.playersRepository.find({
            where: {
                nick: ILike(`%${search}%`),
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async findOne(id: string) {
        const player = await this.playersRepository.findOne({
            where: {
                id,
            },
        });

        if (!player) {
            throw new NotFoundException('Player not found.');
        }

        return player;
    }

    async create(createPlayerDto: CreatePlayerDto) {
        await this.ensureNickIsAvailable(createPlayerDto.nick);

        const player = this.playersRepository.create({
            nick: createPlayerDto.nick,
            notes: createPlayerDto.notes || null,
        });

        return this.playersRepository.save(player);
    }

    async update(id: string, updatePlayerDto: UpdatePlayerDto) {
        const player = await this.findOne(id);

        if (updatePlayerDto.nick && updatePlayerDto.nick !== player.nick) {
            await this.ensureNickIsAvailable(updatePlayerDto.nick);
        }

        Object.assign(player, {
            ...updatePlayerDto,
            notes: updatePlayerDto.notes ?? player.notes,
        });

        return this.playersRepository.save(player);
    }

    async remove(id: string) {
        const player = await this.findOne(id);

        await this.playersRepository.remove(player);

        return {
            deleted: true,
        };
    }

    private async ensureNickIsAvailable(nick: string) {
        const existingPlayer = await this.playersRepository.findOne({
            where: {
                nick,
            },
        });

        if (existingPlayer) {
            throw new ConflictException('Player nick already registered.');
        }
    }
}
