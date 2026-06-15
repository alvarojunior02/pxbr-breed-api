import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FindOwnedPokemonsQueryDto {
    @ApiPropertyOptional({ example: 'Larvesta' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: 'F5 PFT' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ example: 'Fêmea' })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiPropertyOptional({ example: 'Timid' })
    @IsOptional()
    @IsString()
    nature?: string;

    @ApiPropertyOptional({ example: 636 })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    pokemonDexId?: number;

    @ApiPropertyOptional({ example: 'Larvesta' })
    @IsOptional()
    @IsString()
    pokemonName?: string;
}
