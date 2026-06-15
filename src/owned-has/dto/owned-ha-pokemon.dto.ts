import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class OwnedHaPokemonDto {
    @ApiProperty({ example: 636 })
    @IsInt()
    @Min(1)
    pokemonDexId: number;

    @ApiProperty({ example: 'Larvesta' })
    @IsString()
    @MaxLength(80)
    pokemonName: string;

    @ApiPropertyOptional({
        example: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/636.png',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    pokemonSprite?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isBase?: boolean;
}
