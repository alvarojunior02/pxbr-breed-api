import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OwnedPokemonEvolutionDto {
    @ApiProperty({ example: 636 })
    @IsInt()
    @Min(1)
    pokemonId: number;

    @ApiProperty({ example: 'Larvesta' })
    @IsString()
    @MaxLength(80)
    pokemonName: string;

    @ApiPropertyOptional({
        example:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/636.png',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    sprite?: string | null;
}

export class CreateOwnedPokemonDto {
    @ApiProperty({ example: 636 })
    @IsInt()
    @Min(1)
    pokemonDexId: number;

    @ApiProperty({ example: 'Larvesta' })
    @IsString()
    @MaxLength(80)
    pokemonName: string;

    @ApiPropertyOptional({
        example:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/636.png',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    pokemonSprite?: string | null;

    @ApiPropertyOptional({ example: 636 })
    @IsOptional()
    @IsInt()
    @Min(1)
    breedBaseDexId?: number | null;

    @ApiPropertyOptional({ example: 'Larvesta' })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    breedBaseName?: string | null;

    @ApiPropertyOptional({ example: 'alola' })
    @IsOptional()
    @IsString()
    @MaxLength(40)
    regionalForm?: string | null;

    @ApiPropertyOptional({ example: 'Alola' })
    @IsOptional()
    @IsString()
    @MaxLength(40)
    regionalFormLabel?: string | null;

    @ApiPropertyOptional({ example: 'Vulpix de Alola' })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    regionalFormDisplayName?: string | null;

    @ApiPropertyOptional({ example: ['Bug'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    eggGroups?: string[] | null;

    @ApiPropertyOptional({ type: [OwnedPokemonEvolutionDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OwnedPokemonEvolutionDto)
    evolutionLine?: OwnedPokemonEvolutionDto[] | null;

    @ApiProperty({ example: 'F5 PFT' })
    @IsString()
    @MaxLength(40)
    status: string;

    @ApiProperty({ example: 'Fêmea' })
    @IsString()
    @MaxLength(30)
    gender: string;

    @ApiPropertyOptional({ example: 'Timid' })
    @IsOptional()
    @IsString()
    @MaxLength(40)
    nature?: string | null;

    @ApiPropertyOptional({ example: 'Serve para time de Sol.' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string | null;
}
