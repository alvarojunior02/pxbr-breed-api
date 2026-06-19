import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'admin@pxbr.local',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'admin123',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean;
}
