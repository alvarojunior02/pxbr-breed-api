import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreatePlayerDto {
    @ApiProperty({
        example: 'EKNight008',
        minLength: 3,
        maxLength: 16,
    })
    @IsString()
    @MinLength(3)
    @MaxLength(16)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Nick must contain only letters, numbers and underscore.',
    })
    nick: string;

    @ApiPropertyOptional({
        example: 'Cliente frequente.',
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}
