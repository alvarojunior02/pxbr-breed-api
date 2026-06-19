import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateTransactionDto {
    @ApiProperty({ example: 'PLAYER_UUID' })
    @IsUUID()
    playerId: string;

    @ApiProperty({ example: 'ORDER_UUID' })
    @IsUUID()
    orderId: string;

    @ApiProperty({ example: 3500000 })
    @IsInt()
    @Min(1)
    amount: number;

    @ApiPropertyOptional({ example: 'ORDER_PAYMENT' })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    type?: string;

    @ApiPropertyOptional({ example: 'Pagamento parcial.' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}
