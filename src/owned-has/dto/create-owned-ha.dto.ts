import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMinSize,
    IsArray,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OwnedHaPokemonDto } from './owned-ha-pokemon.dto';

export class CreateOwnedHaDto {
    @ApiProperty({ example: 'Flame Body' })
    @IsString()
    @MaxLength(80)
    abilityName: string;

    @ApiPropertyOptional({ example: 'Timid' })
    @IsOptional()
    @IsString()
    @MaxLength(40)
    nature?: string;

    @ApiProperty({ example: 14000000 })
    @IsInt()
    @Min(0)
    breedableValue: number;

    @ApiProperty({ example: 3500000 })
    @IsInt()
    @Min(0)
    castratedValue: number;

    @ApiPropertyOptional({ example: 'Tenho macho e fêmea breedável.' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;

    @ApiProperty({
        type: [OwnedHaPokemonDto],
        example: [
            {
                pokemonDexId: 636,
                pokemonName: 'Larvesta',
                pokemonSprite:
                    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/636.png',
                isBase: true,
            },
            {
                pokemonDexId: 637,
                pokemonName: 'Volcarona',
                pokemonSprite:
                    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/637.png',
                isBase: false,
            },
        ],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OwnedHaPokemonDto)
    pokemons: OwnedHaPokemonDto[];
}
