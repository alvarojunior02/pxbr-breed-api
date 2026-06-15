import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrderStatusHistoryDto {
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
