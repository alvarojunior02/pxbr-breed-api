import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatusHistory } from '../order-status-history/entities/order-status-history.entity';
import { Order } from '../orders/entities/order.entity';
import { OwnedHa } from '../owned-has/entities/owned-ha.entity';
import { OwnedPokemon } from '../owned-pokemons/entities/owned-pokemon.entity';
import { Player } from '../players/entities/player.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { ImportBackupDto } from './dto/import-backup.dto';

type ImportStats = {
    imported: number;
    skipped: number;
};

@Injectable()
export class BackupService {
    constructor(
        @InjectRepository(Player)
        private readonly playersRepository: Repository<Player>,
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,
        @InjectRepository(Transaction)
        private readonly transactionsRepository: Repository<Transaction>,
        @InjectRepository(OrderStatusHistory)
        private readonly orderStatusHistoryRepository: Repository<OrderStatusHistory>,
        @InjectRepository(OwnedPokemon)
        private readonly ownedPokemonsRepository: Repository<OwnedPokemon>,
        @InjectRepository(OwnedHa)
        private readonly ownedHasRepository: Repository<OwnedHa>,
    ) {}

    async exportBackup() {
        const [
            players,
            orders,
            transactions,
            orderStatusHistory,
            ownedPokemons,
            ownedHas,
        ] = await Promise.all([
            this.playersRepository.find({
                order: {
                    createdAt: 'DESC',
                },
            }),
            this.ordersRepository.find({
                order: {
                    createdAt: 'DESC',
                },
            }),
            this.transactionsRepository.find({
                order: {
                    createdAt: 'DESC',
                },
            }),
            this.orderStatusHistoryRepository.find({
                order: {
                    createdAt: 'DESC',
                },
            }),
            this.ownedPokemonsRepository.find({
                order: {
                    createdAt: 'DESC',
                },
            }),
            this.ownedHasRepository.find({
                order: {
                    createdAt: 'DESC',
                },
            }),
        ]);

        return {
            exportedAt: new Date().toISOString(),
            version: 1,
            data: {
                players,
                orders,
                transactions,
                orderStatusHistory,
                ownedPokemons,
                ownedHas,
            },
        };
    }

    async importBackup(importBackupDto: ImportBackupDto) {
        const data = this.normalizeBackupPayload(importBackupDto);

        const players = await this.importPlayers(data.players);
        const orders = await this.importOrders(data.orders);
        const transactions = await this.importTransactions(data.transactions);
        const orderStatusHistory = await this.importOrderStatusHistory(
            data.orderStatusHistory,
        );
        const ownedPokemons = await this.importOwnedPokemons(
            data.ownedPokemons,
        );
        const ownedHas = await this.importOwnedHas(data.ownedHas);

        return {
            success: true,
            mode: 'incremental',
            importedAt: new Date().toISOString(),
            summary: {
                players,
                orders,
                transactions,
                orderStatusHistory,
                ownedPokemons,
                ownedHas,
            },
        };
    }

    private normalizeBackupPayload(importBackupDto: ImportBackupDto) {
        const data =
            'data' in importBackupDto
                ? (importBackupDto.data as ImportBackupDto)
                : importBackupDto;

        return {
            players: data.players || [],
            orders: data.orders || [],
            transactions: data.transactions || [],
            orderStatusHistory: data.orderStatusHistory || [],
            ownedPokemons: data.ownedPokemons || [],
            ownedHas: data.ownedHas || [],
        };
    }

    private async importPlayers(
        players: Record<string, unknown>[],
    ): Promise<ImportStats> {
        const stats = this.createStats();

        for (const player of players) {
            if (await this.existsById(this.playersRepository, player.id)) {
                stats.skipped++;
                continue;
            }

            const { orders, ...playerPayload } = player;

            await this.playersRepository.save(
                this.playersRepository.create(playerPayload),
            );

            stats.imported++;
        }

        return stats;
    }

    private async importOrders(
        orders: Record<string, unknown>[],
    ): Promise<ImportStats> {
        const stats = this.createStats();

        for (const order of orders) {
            if (await this.existsById(this.ordersRepository, order.id)) {
                stats.skipped++;
                continue;
            }

            const { player, transactions, statusHistory, ...orderPayload } =
                order;

            const pokemons = Array.isArray(orderPayload.pokemons)
                ? orderPayload.pokemons.map((pokemon) => {
                      const { order: pokemonOrder, ...pokemonPayload } =
                          pokemon;

                      return pokemonPayload;
                  })
                : [];

            await this.ordersRepository.save(
                this.ordersRepository.create({
                    ...orderPayload,
                    pokemons,
                }),
            );

            stats.imported++;
        }

        return stats;
    }

    private async importTransactions(
        transactions: Record<string, unknown>[],
    ): Promise<ImportStats> {
        const stats = this.createStats();

        for (const transaction of transactions) {
            if (
                await this.existsById(
                    this.transactionsRepository,
                    transaction.id,
                )
            ) {
                stats.skipped++;
                continue;
            }

            const { player, order, ...transactionPayload } = transaction;

            await this.transactionsRepository.save(
                this.transactionsRepository.create(transactionPayload),
            );

            stats.imported++;
        }

        return stats;
    }

    private async importOrderStatusHistory(
        orderStatusHistory: Record<string, unknown>[],
    ): Promise<ImportStats> {
        const stats = this.createStats();

        for (const history of orderStatusHistory) {
            if (
                await this.existsById(
                    this.orderStatusHistoryRepository,
                    history.id,
                )
            ) {
                stats.skipped++;
                continue;
            }

            const { order, ...historyPayload } = history;

            await this.orderStatusHistoryRepository.save(
                this.orderStatusHistoryRepository.create(historyPayload),
            );

            stats.imported++;
        }

        return stats;
    }

    private async importOwnedPokemons(
        ownedPokemons: Record<string, unknown>[],
    ): Promise<ImportStats> {
        const stats = this.createStats();

        for (const ownedPokemon of ownedPokemons) {
            if (
                await this.existsById(
                    this.ownedPokemonsRepository,
                    ownedPokemon.id,
                )
            ) {
                stats.skipped++;
                continue;
            }

            await this.ownedPokemonsRepository.save(
                this.ownedPokemonsRepository.create(ownedPokemon),
            );

            stats.imported++;
        }

        return stats;
    }

    private async importOwnedHas(
        ownedHas: Record<string, unknown>[],
    ): Promise<ImportStats> {
        const stats = this.createStats();

        for (const ownedHa of ownedHas) {
            if (await this.existsById(this.ownedHasRepository, ownedHa.id)) {
                stats.skipped++;
                continue;
            }

            const pokemons = Array.isArray(ownedHa.pokemons)
                ? ownedHa.pokemons.map((pokemon) => {
                      const { ownedHa: pokemonOwnedHa, ...pokemonPayload } =
                          pokemon;

                      return pokemonPayload;
                  })
                : [];

            await this.ownedHasRepository.save(
                this.ownedHasRepository.create({
                    ...ownedHa,
                    pokemons,
                }),
            );

            stats.imported++;
        }

        return stats;
    }

    private async existsById<T extends { id: string }>(
        repository: Repository<T>,
        id: unknown,
    ) {
        if (!id || typeof id !== 'string') {
            return false;
        }

        const existingRecord = await repository.findOne({
            where: {
                id,
            } as never,
        });

        return Boolean(existingRecord);
    }

    private createStats(): ImportStats {
        return {
            imported: 0,
            skipped: 0,
        };
    }
}
