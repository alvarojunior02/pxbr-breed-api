import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class FindOrdersQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    playerId?: string;

    @ApiPropertyOptional({ example: 'PENDING' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ example: 'false' })
    @IsOptional()
    @IsBooleanString()
    archived?: string;

    @ApiPropertyOptional({ enum: ['paid', 'partial', 'pending'] })
    @IsOptional()
    @IsIn(['paid', 'partial', 'pending'])
    paymentStatus?: 'paid' | 'partial' | 'pending';

    @ApiPropertyOptional({ example: 'EKNight008' })
    @IsOptional()
    @IsString()
    search?: string;
}
