import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateOrderStatusHistoryDto {
    @ApiPropertyOptional({ example: 'order-pokemon-uuid' })
    @IsOptional()
    @IsString()
    orderPokemonId?: string;

    @ApiPropertyOptional({ example: 636 })
    @IsOptional()
    @IsInt()
    @Min(1)
    pokemonDexId?: number;

    @ApiPropertyOptional({ example: 'Larvesta' })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    pokemonName?: string;

    @ApiPropertyOptional({ example: 'Pendente' })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    oldStatus?: string;

    @ApiProperty({ example: 'Em andamento' })
    @IsString()
    @MaxLength(60)
    newStatus: string;

    @ApiPropertyOptional({ example: 'Cliente confirmou o pagamento inicial.' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}
