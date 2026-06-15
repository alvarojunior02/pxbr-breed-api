import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOwnedHaDto } from './dto/create-owned-ha.dto';
import { FindOwnedHasQueryDto } from './dto/find-owned-has-query.dto';
import { OwnedHaPokemonDto } from './dto/owned-ha-pokemon.dto';
import { UpdateOwnedHaDto } from './dto/update-owned-ha.dto';
import { OwnedHaPokemon } from './entities/owned-ha-pokemon.entity';
import { OwnedHa } from './entities/owned-ha.entity';

@Injectable()
export class OwnedHasService {
    constructor(
        @InjectRepository(OwnedHa)
        private readonly ownedHasRepository: Repository<OwnedHa>,
    ) {}

    async findAll(query: FindOwnedHasQueryDto) {
        const ownedHas = await this.ownedHasRepository.find({
            order: {
                createdAt: 'DESC',
            },
        });

        return ownedHas.filter((ownedHa) =>
            this.matchesFilters(ownedHa, query),
        );
    }

    async findOne(id: string) {
        const ownedHa = await this.ownedHasRepository.findOne({
            where: {
                id,
            },
        });

        if (!ownedHa) {
            throw new NotFoundException('Owned HA not found.');
        }

        return ownedHa;
    }

    async create(createOwnedHaDto: CreateOwnedHaDto) {
        const ownedHa = this.ownedHasRepository.create({
            abilityName: createOwnedHaDto.abilityName,
            nature: createOwnedHaDto.nature || null,
            breedableValue: createOwnedHaDto.breedableValue,
            castratedValue: createOwnedHaDto.castratedValue,
            notes: createOwnedHaDto.notes || null,
            pokemons: this.createOwnedHaPokemons(createOwnedHaDto.pokemons),
            regionalForm: createOwnedHaDto.regionalForm || null,
            regionalFormLabel: createOwnedHaDto.regionalFormLabel || null,
            regionalFormDisplayName:
                createOwnedHaDto.regionalFormDisplayName || null,
        });

        return this.ownedHasRepository.save(ownedHa);
    }

    async update(id: string, updateOwnedHaDto: UpdateOwnedHaDto) {
        const ownedHa = await this.findOne(id);

        Object.assign(ownedHa, {
            ...updateOwnedHaDto,
            nature:
                updateOwnedHaDto.nature === undefined
                    ? ownedHa.nature
                    : updateOwnedHaDto.nature || null,
            notes:
                updateOwnedHaDto.notes === undefined
                    ? ownedHa.notes
                    : updateOwnedHaDto.notes || null,
            regionalForm:
                updateOwnedHaDto.regionalForm === undefined
                    ? ownedHa.regionalForm
                    : updateOwnedHaDto.regionalForm || null,
            regionalFormLabel:
                updateOwnedHaDto.regionalFormLabel === undefined
                    ? ownedHa.regionalFormLabel
                    : updateOwnedHaDto.regionalFormLabel || null,
            regionalFormDisplayName:
                updateOwnedHaDto.regionalFormDisplayName === undefined
                    ? ownedHa.regionalFormDisplayName
                    : updateOwnedHaDto.regionalFormDisplayName || null,
        });

        if (updateOwnedHaDto.pokemons) {
            ownedHa.pokemons = this.createOwnedHaPokemons(
                updateOwnedHaDto.pokemons,
            );
        }

        return this.ownedHasRepository.save(ownedHa);
    }

    async remove(id: string) {
        const ownedHa = await this.findOne(id);

        await this.ownedHasRepository.remove(ownedHa);

        return {
            deleted: true,
        };
    }

    private createOwnedHaPokemons(pokemons: OwnedHaPokemonDto[]) {
        return pokemons.map((pokemon) => {
            const ownedHaPokemon = new OwnedHaPokemon();

            Object.assign(ownedHaPokemon, {
                pokemonDexId: pokemon.pokemonDexId,
                pokemonName: pokemon.pokemonName,
                pokemonSprite: pokemon.pokemonSprite || null,
                isBase: pokemon.isBase || false,
            });

            return ownedHaPokemon;
        });
    }

    private matchesFilters(ownedHa: OwnedHa, query: FindOwnedHasQueryDto) {
        const matchesSearch = this.matchesSearch(ownedHa, query.search);
        const matchesNature = !query.nature || ownedHa.nature === query.nature;
        const matchesAbility =
            !query.abilityName ||
            ownedHa.abilityName.toLowerCase() ===
                query.abilityName.toLowerCase();
        const matchesPokemonDexId =
            !query.pokemonDexId ||
            ownedHa.pokemons?.some(
                (pokemon) => pokemon.pokemonDexId === query.pokemonDexId,
            );
        const normalizedPokemonName = query.pokemonName?.toLowerCase();

        const matchesPokemonName =
            !normalizedPokemonName ||
            ownedHa.pokemons?.some(
                (pokemon) =>
                    pokemon.pokemonName.toLowerCase() === normalizedPokemonName,
            );

        return (
            matchesSearch &&
            matchesNature &&
            matchesAbility &&
            matchesPokemonDexId &&
            matchesPokemonName
        );
    }

    private matchesSearch(ownedHa: OwnedHa, search?: string) {
        if (!search) {
            return true;
        }

        const normalizedSearch = search.trim().toLowerCase();

        const searchableText = [
            ownedHa.abilityName,
            ownedHa.nature,
            ownedHa.notes,
            ...(ownedHa.pokemons || []).flatMap((pokemon) => [
                pokemon.pokemonDexId,
                pokemon.pokemonName,
            ]),
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableText.includes(normalizedSearch);
    }
}
