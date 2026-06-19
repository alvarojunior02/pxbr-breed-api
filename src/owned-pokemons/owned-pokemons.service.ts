import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOwnedPokemonDto } from './dto/create-owned-pokemon.dto';
import { FindOwnedPokemonsQueryDto } from './dto/find-owned-pokemons-query.dto';
import { UpdateOwnedPokemonDto } from './dto/update-owned-pokemon.dto';
import { OwnedPokemon } from './entities/owned-pokemon.entity';

@Injectable()
export class OwnedPokemonsService {
    constructor(
        @InjectRepository(OwnedPokemon)
        private readonly ownedPokemonsRepository: Repository<OwnedPokemon>,
    ) {}

    async findAll(query: FindOwnedPokemonsQueryDto) {
        const ownedPokemons = await this.ownedPokemonsRepository.find({
            order: {
                createdAt: 'DESC',
            },
        });

        return ownedPokemons.filter((ownedPokemon) => this.matchesFilters(ownedPokemon, query));
    }

    async findOne(id: string) {
        const ownedPokemon = await this.ownedPokemonsRepository.findOne({
            where: {
                id,
            },
        });

        if (!ownedPokemon) {
            throw new NotFoundException('Owned Pokémon not found.');
        }

        return ownedPokemon;
    }

    async create(createOwnedPokemonDto: CreateOwnedPokemonDto) {
        const ownedPokemon = this.ownedPokemonsRepository.create({
            pokemonDexId: createOwnedPokemonDto.pokemonDexId,
            pokemonName: createOwnedPokemonDto.pokemonName,
            pokemonSprite: createOwnedPokemonDto.pokemonSprite || null,
            breedBaseDexId: createOwnedPokemonDto.breedBaseDexId || null,
            breedBaseName: createOwnedPokemonDto.breedBaseName || null,
            regionalForm: createOwnedPokemonDto.regionalForm || null,
            regionalFormLabel: createOwnedPokemonDto.regionalFormLabel || null,
            regionalFormDisplayName: createOwnedPokemonDto.regionalFormDisplayName || null,
            eggGroups: createOwnedPokemonDto.eggGroups || [],
            evolutionLine: createOwnedPokemonDto.evolutionLine || [],
            status: createOwnedPokemonDto.status,
            gender: createOwnedPokemonDto.gender,
            nature: createOwnedPokemonDto.nature || null,
            notes: createOwnedPokemonDto.notes || null,
        });

        return this.ownedPokemonsRepository.save(ownedPokemon);
    }

    async update(id: string, updateOwnedPokemonDto: UpdateOwnedPokemonDto) {
        const ownedPokemon = await this.findOne(id);

        Object.assign(ownedPokemon, {
            ...updateOwnedPokemonDto,
            pokemonSprite:
                updateOwnedPokemonDto.pokemonSprite === undefined
                    ? ownedPokemon.pokemonSprite
                    : updateOwnedPokemonDto.pokemonSprite || null,
            breedBaseDexId:
                updateOwnedPokemonDto.breedBaseDexId === undefined
                    ? ownedPokemon.breedBaseDexId
                    : updateOwnedPokemonDto.breedBaseDexId || null,
            breedBaseName:
                updateOwnedPokemonDto.breedBaseName === undefined
                    ? ownedPokemon.breedBaseName
                    : updateOwnedPokemonDto.breedBaseName || null,
            nature:
                updateOwnedPokemonDto.nature === undefined
                    ? ownedPokemon.nature
                    : updateOwnedPokemonDto.nature || null,
            notes:
                updateOwnedPokemonDto.notes === undefined
                    ? ownedPokemon.notes
                    : updateOwnedPokemonDto.notes || null,
            regionalForm:
                updateOwnedPokemonDto.regionalForm === undefined
                    ? ownedPokemon.regionalForm
                    : updateOwnedPokemonDto.regionalForm || null,
            regionalFormLabel:
                updateOwnedPokemonDto.regionalFormLabel === undefined
                    ? ownedPokemon.regionalFormLabel
                    : updateOwnedPokemonDto.regionalFormLabel || null,
            regionalFormDisplayName:
                updateOwnedPokemonDto.regionalFormDisplayName === undefined
                    ? ownedPokemon.regionalFormDisplayName
                    : updateOwnedPokemonDto.regionalFormDisplayName || null,
            eggGroups:
                updateOwnedPokemonDto.eggGroups === undefined
                    ? ownedPokemon.eggGroups
                    : updateOwnedPokemonDto.eggGroups || [],
            evolutionLine:
                updateOwnedPokemonDto.evolutionLine === undefined
                    ? ownedPokemon.evolutionLine
                    : updateOwnedPokemonDto.evolutionLine || [],
        });

        return this.ownedPokemonsRepository.save(ownedPokemon);
    }

    async remove(id: string) {
        const ownedPokemon = await this.findOne(id);

        await this.ownedPokemonsRepository.remove(ownedPokemon);

        return {
            deleted: true,
        };
    }

    private matchesFilters(ownedPokemon: OwnedPokemon, query: FindOwnedPokemonsQueryDto) {
        const matchesSearch = this.matchesSearch(ownedPokemon, query.search);
        const matchesStatus = !query.status || ownedPokemon.status === query.status;
        const matchesGender = !query.gender || ownedPokemon.gender === query.gender;
        const matchesNature = !query.nature || ownedPokemon.nature === query.nature;
        const matchesDexId =
            !query.pokemonDexId || ownedPokemon.pokemonDexId === query.pokemonDexId;
        const matchesName =
            !query.pokemonName ||
            ownedPokemon.pokemonName.toLowerCase() === query.pokemonName.toLowerCase();

        return (
            matchesSearch &&
            matchesStatus &&
            matchesGender &&
            matchesNature &&
            matchesDexId &&
            matchesName
        );
    }

    private matchesSearch(ownedPokemon: OwnedPokemon, search?: string) {
        if (!search) {
            return true;
        }

        const normalizedSearch = search.trim().toLowerCase();

        const searchableText = [
            ownedPokemon.pokemonDexId,
            ownedPokemon.pokemonName,
            ownedPokemon.breedBaseDexId,
            ownedPokemon.breedBaseName,
            ownedPokemon.status,
            ownedPokemon.gender,
            ownedPokemon.nature,
            ownedPokemon.notes,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableText.includes(normalizedSearch);
    }
}
