import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FindOwnedHasQueryDto {
    @ApiPropertyOptional({ example: 'Flame Body' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: 'Timid' })
    @IsOptional()
    @IsString()
    nature?: string;

    @ApiPropertyOptional({ example: 'Flame Body' })
    @IsOptional()
    @IsString()
    abilityName?: string;

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
