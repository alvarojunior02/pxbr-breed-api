import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BackupService } from './backup.service';
import { ImportBackupDto } from './dto/import-backup.dto';

@ApiTags('Backup')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing access token.' })
@UseGuards(JwtAuthGuard)
@Controller('backup')
export class BackupController {
    constructor(private readonly backupService: BackupService) {}

    @Get('export')
    @ApiOperation({ summary: 'Export database backup' })
    @ApiOkResponse({
        description: 'Returns a JSON backup from current database.',
    })
    exportBackup() {
        return this.backupService.exportBackup();
    }

    @Post('import')
    @ApiOperation({ summary: 'Import database backup incrementally' })
    @ApiBody({ type: ImportBackupDto })
    @ApiCreatedResponse({ description: 'Backup imported incrementally.' })
    importBackup(@Body() importBackupDto: ImportBackupDto) {
        return this.backupService.importBackup(importBackupDto);
    }
}
