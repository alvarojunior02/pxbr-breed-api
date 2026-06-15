import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing access token.' })
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get()
    @ApiOperation({ summary: 'Get application settings' })
    @ApiOkResponse({ description: 'Returns application settings.' })
    getSettings() {
        return this.settingsService.getSettings();
    }

    @Patch()
    @ApiOperation({ summary: 'Update application settings' })
    @ApiOkResponse({
        description: 'Application settings updated successfully.',
    })
    update(@Body() updateSettingsDto: UpdateSettingsDto) {
        return this.settingsService.update(updateSettingsDto);
    }
}
