import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class ImportBackupDto {
    @ApiPropertyOptional({ type: Array })
    @IsOptional()
    @IsArray()
    players?: Record<string, unknown>[];

    @ApiPropertyOptional({ type: Array })
    @IsOptional()
    @IsArray()
    orders?: Record<string, unknown>[];

    @ApiPropertyOptional({ type: Array })
    @IsOptional()
    @IsArray()
    transactions?: Record<string, unknown>[];

    @ApiPropertyOptional({ type: Array })
    @IsOptional()
    @IsArray()
    orderStatusHistory?: Record<string, unknown>[];

    @ApiPropertyOptional({ type: Array })
    @IsOptional()
    @IsArray()
    ownedPokemons?: Record<string, unknown>[];

    @ApiPropertyOptional({ type: Array })
    @IsOptional()
    @IsArray()
    ownedHas?: Record<string, unknown>[];
}
