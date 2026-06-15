import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

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
    pokemonSprite?: string;

    @ApiPropertyOptional({ example: 636 })
    @IsOptional()
    @IsInt()
    @Min(1)
    breedBaseDexId?: number;

    @ApiPropertyOptional({ example: 'Larvesta' })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    breedBaseName?: string;

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
    nature?: string;

    @ApiPropertyOptional({ example: 'Serve para time de Sol.' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}
