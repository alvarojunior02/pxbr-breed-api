import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { FindReportsQueryDto } from './dto/find-reports-query.dto';

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
    getTopSellingPokemons(@Query() query: FindReportsQueryDto) {
        return this.reportsService.getTopSellingPokemons(query);
    }

    @Get('top-selling-has')
    @ApiOperation({ summary: 'Get top selling HAs report' })
    @ApiOkResponse({ description: 'Returns top selling HAs.' })
    getTopSellingHas(@Query() query: FindReportsQueryDto) {
        return this.reportsService.getTopSellingHas(query);
    }

    @Get('top-buying-players')
    @ApiOperation({ summary: 'Get top buying players report' })
    @ApiOkResponse({ description: 'Returns top buying players.' })
    getTopBuyingPlayers(@Query() query: FindReportsQueryDto) {
        return this.reportsService.getTopBuyingPlayers(query);
    }

    @Get('players-debt')
    @ApiOperation({ summary: 'Get players debt report' })
    @ApiOkResponse({ description: 'Returns players with pending debt.' })
    getPlayersDebt(@Query() query: FindReportsQueryDto) {
        return this.reportsService.getPlayersDebt(query);
    }

    @Get('dashboard-summary')
    @ApiOperation({ summary: 'Get dashboard summary report' })
    @ApiOkResponse({ description: 'Returns dashboard summary metrics.' })
    getDashboardSummary(@Query() query: FindReportsQueryDto) {
        return this.reportsService.getDashboardSummary(query);
    }

    @Get('revenue-by-day')
    @ApiOperation({ summary: 'Get daily revenue report' })
    @ApiOkResponse({
        description: 'Returns daily revenue grouped by order creation date.',
    })
    getRevenueByDay(@Query() query: FindReportsQueryDto) {
        return this.reportsService.getRevenueByDay(query);
    }
}
