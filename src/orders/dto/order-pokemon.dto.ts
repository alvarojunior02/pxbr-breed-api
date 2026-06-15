import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class OrderPokemonDto {
    @ApiProperty({ example: 37 })
    @IsInt()
    @Min(1)
    pokemonId: number;

    @ApiProperty({ example: 'Vulpix' })
    @IsString()
    @MaxLength(100)
    pokemonName: string;

    @ApiPropertyOptional({ example: 'https://play.pokemonshowdown.com/sprites/dex/vulpix-alola.png' })
    @IsOptional()
    @IsString()
    sprite?: string;

    @ApiPropertyOptional({ example: 37 })
    @IsOptional()
    @IsInt()
    @Min(1)
    breedPokemonId?: number;

    @ApiPropertyOptional({ example: 'Vulpix' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    breedPokemonName?: string;

    @ApiProperty({ example: 'Timid' })
    @IsString()
    @MaxLength(40)
    nature: string;

    @ApiPropertyOptional({ example: 'Flame Body' })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    abilityName?: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    abilityIsHa: boolean;

    @ApiPropertyOptional({ example: 'ALOLA' })
    @IsOptional()
    @IsString()
    @MaxLength(40)
    regionalForm?: string;

    @ApiPropertyOptional({ example: 'Alola' })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    regionalFormLabel?: string;

    @ApiPropertyOptional({ example: 'Vulpix de Alola' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    regionalFormDisplayName?: string;

    @ApiProperty({ example: 3500000 })
    @IsInt()
    @Min(0)
    value: number;

    @ApiProperty({ example: false })
    @IsBoolean()
    breedable: boolean;

    @ApiProperty({ example: 'PENDING' })
    @IsString()
    @MaxLength(40)
    status: string;
}
