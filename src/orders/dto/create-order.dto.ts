import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderPokemonDto } from './order-pokemon.dto';

export class CreateOrderDto {
    @ApiProperty({ example: 'f03c88bd-9f5a-4757-86f7-7996bc676af8' })
    @IsUUID()
    playerId: string;

    @ApiProperty({ example: 14000000 })
    @IsInt()
    @Min(0)
    subtotal: number;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    discount?: number;

    @ApiProperty({ example: 14000000 })
    @IsInt()
    @Min(0)
    total: number;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    paidAmount?: number;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    paid?: boolean;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    needsFemale?: boolean;

    @ApiPropertyOptional({ example: 'Cliente pediu prioridade.' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    observations?: string;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    archived?: boolean;

    @ApiProperty({ type: [OrderPokemonDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderPokemonDto)
    pokemons: OrderPokemonDto[];
}
