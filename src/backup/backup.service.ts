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
import { Settings } from '../settings/entities/settings.entity';

type ImportStats = {
    imported: number;
    skipped: number;
    invalid: number;
};

type NormalizedOwnedPokemonBackup = {
    id?: string;
    pokemonDexId: number | null;
    pokemonName: string | null;
    pokemonSprite: string | null;
    breedBaseDexId: number | null;
    breedBaseName: string | null;
    status?: string;
    gender?: string;
    nature: string | null;
    notes: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};

type NormalizedOwnedHaBackup = {
    id?: string;
    abilityName: string | null;
    nature: string | null;
    breedableValue: number | null;
    castratedValue: number | null;
    notes: string | null;
    pokemons: NormalizedOwnedHaPokemonBackup[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};

type NormalizedOwnedHaPokemonBackup = {
    id?: string;
    pokemonDexId: number;
    pokemonName: string;
    pokemonSprite: string | null;
    isBase: boolean;
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
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>,
    ) {}

    async exportBackup() {
        const [
            players,
            orders,
            transactions,
            orderStatusHistory,
            ownedPokemons,
            ownedHas,
            systemSettings,
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
            this.settingsRepository.findOne({
                where: {},
                order: {
                    createdAt: 'ASC',
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
                ownedHiddenAbilities: ownedHas,
                settings: systemSettings,
                systemSettings,
            },
        };
    }

    async importBackup(importBackupDto: ImportBackupDto) {
        const data = this.normalizeBackupPayload(importBackupDto);

        const importedPlayerIds = new Set<string>();
        const importedOrderIds = new Set<string>();

        const players = await this.importPlayers(
            data.players,
            importedPlayerIds,
        );
        const orders = await this.importOrders(
            data.orders,
            importedPlayerIds,
            importedOrderIds,
        );
        const transactions = await this.importTransactions(
            data.transactions,
            importedPlayerIds,
            importedOrderIds,
        );
        const orderStatusHistory = await this.importOrderStatusHistory(
            data.orderStatusHistory,
            importedOrderIds,
        );
        const ownedPokemons = await this.importOwnedPokemons(
            data.ownedPokemons,
        );
        const ownedHas = await this.importOwnedHas(data.ownedHas);
        const settings = await this.importSettings(data.settings);

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
                settings,
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
            ownedHas: data.ownedHas || data.ownedHiddenAbilities || [],
            settings: this.normalizeSettingsPayload(data),
        };
    }

    private normalizeSettingsPayload(data: ImportBackupDto) {
        if (data.settings) {
            return Array.isArray(data.settings)
                ? data.settings
                : [data.settings];
        }

        if (data.systemSettings) {
            return Array.isArray(data.systemSettings)
                ? data.systemSettings
                : [data.systemSettings];
        }

        return [];
    }

    private async importPlayers(
        players: Record<string, unknown>[],
        importedPlayerIds: Set<string>,
    ): Promise<ImportStats> {
        const stats = this.createStats();

        for (const player of players) {
            if (await this.existsById(this.playersRepository, player.id)) {
                if (typeof player.id === 'string') {
                    importedPlayerIds.add(player.id);
                }

                stats.skipped++;
                continue;
            }

            const { orders, ...playerPayload } = player;

            const savedPlayer = await this.playersRepository.save(
                this.playersRepository.create(playerPayload),
            );

            if (typeof savedPlayer.id === 'string') {
                importedPlayerIds.add(savedPlayer.id);
            }

            stats.imported++;
        }

        return stats;
    }

    private async importOrders(
        orders: Record<string, unknown>[],
        importedPlayerIds: Set<string>,
        importedOrderIds: Set<string>,
    ): Promise<ImportStats> {
        const stats = this.createStats();

        for (const order of orders) {
            if (await this.existsById(this.ordersRepository, order.id)) {
                if (typeof order.id === 'string') {
                    importedOrderIds.add(order.id);
                }

                stats.skipped++;
                continue;
            }

            if (!(await this.canUsePlayer(order.playerId, importedPlayerIds))) {
                stats.invalid++;
                continue;
            }

            const { player, transactions, statusHistory, ...orderPayload } =
                order;

            const pokemons = Array.isArray(orderPayload.pokemons)
                ? orderPayload.pokemons
                      .map((pokemon) =>
                          this.normalizeOrderPokemonPayload(pokemon),
                      )
                      .filter(
                          (pokemon) => pokemon.pokemonId && pokemon.pokemonName,
                      )
                : [];

            const savedOrder = await this.ordersRepository.save(
                this.ordersRepository.create({
                    ...orderPayload,
                    pokemons,
                }),
            );

            if (typeof savedOrder.id === 'string') {
                importedOrderIds.add(savedOrder.id);
            }

            stats.imported++;
        }

        return stats;
    }

    private normalizeOrderPokemonPayload(pokemon: Record<string, unknown>) {
        const { order: pokemonOrder, ...pokemonPayload } = pokemon;

        return {
            ...pokemonPayload,
            pokemonId:
                this.getBackupNumber(
                    pokemon.pokemonId || pokemon.pokemonDexId,
                ) || 0,
            pokemonName:
                this.getBackupString(pokemon.pokemonName || pokemon.name) ||
                'Unknown',
            sprite: this.getBackupString(
                pokemon.sprite || pokemon.pokemonSprite,
            ),
            breedPokemonId: this.getBackupNumber(
                pokemon.breedPokemonId || pokemon.breedBaseDexId,
            ),
            breedPokemonName: this.getBackupString(
                pokemon.breedPokemonName || pokemon.breedBaseName,
            ),
            nature: this.getBackupString(pokemon.nature) || 'Não definida',
            abilityName: this.getBackupString(pokemon.abilityName),
            abilityIsHa: Boolean(pokemon.abilityIsHa),
            regionalForm: this.getBackupString(pokemon.regionalForm),
            regionalFormLabel: this.getBackupString(pokemon.regionalFormLabel),
            regionalFormDisplayName: this.getBackupString(
                pokemon.regionalFormDisplayName,
            ),
            value: this.getBackupNumber(pokemon.value) || 0,
            breedable: Boolean(pokemon.breedable),
            status: this.getBackupString(pokemon.status) || 'PENDING',
        };
    }

    private async importTransactions(
        transactions: Record<string, unknown>[],
        importedPlayerIds: Set<string>,
        importedOrderIds: Set<string>,
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

            const canUsePlayer = await this.canUsePlayer(
                transaction.playerId,
                importedPlayerIds,
            );
            const canUseOrder = await this.canUseOrder(
                transaction.orderId,
                importedOrderIds,
            );

            if (!canUsePlayer || !canUseOrder) {
                stats.invalid++;
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
        importedOrderIds: Set<string>,
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

            if (!(await this.canUseOrder(history.orderId, importedOrderIds))) {
                stats.invalid++;
                continue;
            }

            const { order, ...historyPayload } = history;

            await this.orderStatusHistoryRepository.save(
                this.orderStatusHistoryRepository.create({
                    ...historyPayload,
                    orderPokemonId:
                        this.getBackupString(history.orderPokemonId) ||
                        this.getBackupString(history.pokemonId),
                    pokemonDexId: this.getBackupNumber(history.pokemonDexId),
                    pokemonName: this.getBackupString(history.pokemonName),
                    oldStatus:
                        this.getBackupString(history.oldStatus) ||
                        this.getBackupString(history.previousStatus),
                    newStatus: this.getBackupString(history.newStatus) || 'PENDING',
                    notes: this.getBackupString(history.notes),
                }),
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

            const normalizedOwnedPokemon =
                this.normalizeOwnedPokemonPayload(ownedPokemon);

            if (
                !normalizedOwnedPokemon.pokemonDexId ||
                !normalizedOwnedPokemon.pokemonName
            ) {
                stats.invalid++;
                continue;
            }

            await this.ownedPokemonsRepository.save(
                this.ownedPokemonsRepository.create({
                    ...normalizedOwnedPokemon,
                    pokemonDexId: normalizedOwnedPokemon.pokemonDexId,
                    pokemonName: normalizedOwnedPokemon.pokemonName,
                }),
            );

            stats.imported++;
        }

        return stats;
    }

    private getBackupNumber(value: unknown): number | null {
        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'string' && value.trim()) {
            const parsedValue = Number(value);

            return Number.isNaN(parsedValue) ? null : parsedValue;
        }

        return null;
    }

    private getBackupString(value: unknown): string | null {
        if (typeof value === 'string' && value.trim()) {
            return value;
        }

        return null;
    }

    private normalizeOwnedPokemonPayload(
        ownedPokemon: Record<string, unknown>,
    ): NormalizedOwnedPokemonBackup {
        return {
            id: this.getBackupString(ownedPokemon.id) || undefined,
            pokemonDexId: this.getBackupNumber(
                ownedPokemon.pokemonDexId ||
                    ownedPokemon.pokemonId ||
                    ownedPokemon.dexId,
            ),
            pokemonName: this.getBackupString(
                ownedPokemon.pokemonName || ownedPokemon.name,
            ),
            pokemonSprite: this.getBackupString(
                ownedPokemon.pokemonSprite || ownedPokemon.sprite,
            ),
            breedBaseDexId: this.getBackupNumber(
                ownedPokemon.breedBaseDexId ||
                    ownedPokemon.breedPokemonId ||
                    ownedPokemon.basePokemonId,
            ),
            breedBaseName: this.getBackupString(
                ownedPokemon.breedBaseName ||
                    ownedPokemon.breedPokemonName ||
                    ownedPokemon.basePokemonName,
            ),
            status:
                this.getBackupString(ownedPokemon.status) ||
                this.getBackupString(ownedPokemon.breedLevel) ||
                this.getBackupString(ownedPokemon.level) ||
                'CAPTURED',
            gender:
                this.getBackupString(ownedPokemon.gender) ||
                this.getBackupString(ownedPokemon.sex) ||
                'GENDERLESS',
            nature: this.getBackupString(ownedPokemon.nature),
            notes: this.getBackupString(
                ownedPokemon.notes || ownedPokemon.observations,
            ),
            createdAt:
                this.getBackupString(ownedPokemon.createdAt) || undefined,
            updatedAt:
                this.getBackupString(ownedPokemon.updatedAt) || undefined,
        };
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

            const normalizedOwnedHa = this.normalizeOwnedHaPayload(ownedHa);

            if (
                !normalizedOwnedHa.abilityName ||
                normalizedOwnedHa.breedableValue === null ||
                normalizedOwnedHa.castratedValue === null ||
                normalizedOwnedHa.pokemons.length === 0
            ) {
                stats.invalid++;
                continue;
            }

            await this.ownedHasRepository.save(
                this.ownedHasRepository.create({
                    ...normalizedOwnedHa,
                    abilityName: normalizedOwnedHa.abilityName,
                    breedableValue: normalizedOwnedHa.breedableValue,
                    castratedValue: normalizedOwnedHa.castratedValue,
                }),
            );

            stats.imported++;
        }

        return stats;
    }

    private normalizeOwnedHaPayload(
        ownedHa: Record<string, unknown>,
    ): NormalizedOwnedHaBackup {
        const basePokemonId = this.getBackupNumber(
            ownedHa.pokemonId || ownedHa.pokemonDexId,
        );

        const pokemonsSource = Array.isArray(ownedHa.pokemons)
            ? ownedHa.pokemons
            : Array.isArray(ownedHa.evolutionLine)
              ? ownedHa.evolutionLine
              : [];

        const pokemons: NormalizedOwnedHaPokemonBackup[] = pokemonsSource
            .map((pokemon) =>
                this.normalizeOwnedHaPokemonPayload(pokemon, basePokemonId),
            )
            .filter(
                (pokemon): pokemon is NormalizedOwnedHaPokemonBackup =>
                    pokemon !== null,
            );

        if (pokemons.length === 0 && basePokemonId) {
            const pokemonName = this.getBackupString(
                ownedHa.pokemonName || ownedHa.name,
            );

            if (pokemonName) {
                pokemons.push({
                    pokemonDexId: basePokemonId,
                    pokemonName,
                    pokemonSprite: this.getBackupString(
                        ownedHa.pokemonSprite || ownedHa.sprite,
                    ),
                    isBase: true,
                });
            }
        }

        return {
            id: this.getBackupString(ownedHa.id) || undefined,
            abilityName: this.getBackupString(ownedHa.abilityName),
            nature: this.getBackupString(ownedHa.nature),
            breedableValue: this.getBackupNumber(
                ownedHa.breedableValue || ownedHa.breedablePrice,
            ),
            castratedValue: this.getBackupNumber(
                ownedHa.castratedValue || ownedHa.castratedPrice,
            ),
            notes: this.getBackupString(ownedHa.notes || ownedHa.observations),
            pokemons,
            createdAt: this.getBackupString(ownedHa.createdAt) || undefined,
            updatedAt: this.getBackupString(ownedHa.updatedAt) || undefined,
        };
    }

    private normalizeOwnedHaPokemonPayload(
        pokemon: Record<string, unknown>,
        basePokemonId: number | null,
    ): NormalizedOwnedHaPokemonBackup | null {
        const pokemonDexId = this.getBackupNumber(
            pokemon.pokemonDexId || pokemon.pokemonId || pokemon.dexId,
        );
        const pokemonName = this.getBackupString(
            pokemon.pokemonName || pokemon.name,
        );

        if (!pokemonDexId || !pokemonName) {
            return null;
        }

        return {
            id: this.getBackupString(pokemon.id) || undefined,
            pokemonDexId,
            pokemonName,
            pokemonSprite: this.getBackupString(
                pokemon.pokemonSprite || pokemon.sprite,
            ),
            isBase: basePokemonId
                ? pokemonDexId === basePokemonId
                : Boolean(pokemon.isBase),
        };
    }

    private async importSettings(
        settings: Record<string, unknown>[],
    ): Promise<ImportStats> {
        const stats = this.createStats();

        for (const setting of settings) {
            if (await this.existsById(this.settingsRepository, setting.id)) {
                stats.skipped++;
                continue;
            }

            await this.settingsRepository.save(
                this.settingsRepository.create(setting),
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

    private async canUsePlayer(
        playerId: unknown,
        importedPlayerIds: Set<string>,
    ) {
        if (!playerId || typeof playerId !== 'string') {
            return false;
        }

        if (importedPlayerIds.has(playerId)) {
            return true;
        }

        return this.existsById(this.playersRepository, playerId);
    }

    private async canUseOrder(orderId: unknown, importedOrderIds: Set<string>) {
        if (!orderId || typeof orderId !== 'string') {
            return false;
        }

        if (importedOrderIds.has(orderId)) {
            return true;
        }

        return this.existsById(this.ordersRepository, orderId);
    }

    private createStats(): ImportStats {
        return {
            imported: 0,
            skipped: 0,
            invalid: 0,
        };
    }
}
