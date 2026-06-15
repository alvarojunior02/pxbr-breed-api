import { Controller, Get, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing access token.' })
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('top-selling-pokemons')
    @ApiOperation({ summary: 'Get top selling Pokémons report' })
    @ApiOkResponse({ description: 'Returns top selling Pokémons.' })
    getTopSellingPokemons() {
        return this.reportsService.getTopSellingPokemons();
    }

    @Get('top-selling-has')
    @ApiOperation({ summary: 'Get top selling HAs report' })
    @ApiOkResponse({ description: 'Returns top selling HAs.' })
    getTopSellingHas() {
        return this.reportsService.getTopSellingHas();
    }

    @Get('top-buying-players')
    @ApiOperation({ summary: 'Get top buying players report' })
    @ApiOkResponse({ description: 'Returns top buying players.' })
    getTopBuyingPlayers() {
        return this.reportsService.getTopBuyingPlayers();
    }

    @Get('players-debt')
    @ApiOperation({ summary: 'Get players debt report' })
    @ApiOkResponse({ description: 'Returns players with pending debt.' })
    getPlayersDebt() {
        return this.reportsService.getPlayersDebt();
    }

    @Get('dashboard-summary')
    @ApiOperation({ summary: 'Get dashboard summary report' })
    @ApiOkResponse({ description: 'Returns dashboard summary metrics.' })
    getDashboardSummary() {
        return this.reportsService.getDashboardSummary();
    }
}
