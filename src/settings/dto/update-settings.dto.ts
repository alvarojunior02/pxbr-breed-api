import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateSettingsDto {
    @ApiPropertyOptional({ example: 14000000 })
    @IsOptional()
    @IsInt()
    @Min(0)
    breedableDefaultValue?: number;

    @ApiPropertyOptional({ example: 3500000 })
    @IsOptional()
    @IsInt()
    @Min(0)
    castratedDefaultValue?: number;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    backupVersion?: number;
}
