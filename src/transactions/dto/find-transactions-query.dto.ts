import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class FindTransactionsQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    playerId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    orderId?: string;

    @ApiPropertyOptional({ example: 'ORDER_PAYMENT' })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({ example: 'EKNight008' })
    @IsOptional()
    @IsString()
    search?: string;
}
