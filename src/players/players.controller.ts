import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayersService } from './players.service';

@ApiTags('Players')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing access token.' })
@UseGuards(JwtAuthGuard)
@Controller('players')
export class PlayersController {
    constructor(private readonly playersService: PlayersService) {}

    @Get()
    @ApiOperation({ summary: 'List players' })
    @ApiQuery({ name: 'search', required: false })
    @ApiOkResponse({ description: 'Returns players list.' })
    findAll(@Query('search') search?: string) {
        return this.playersService.findAll(search);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get player by id' })
    @ApiOkResponse({ description: 'Returns selected player.' })
    @ApiNotFoundResponse({ description: 'Player not found.' })
    findOne(@Param('id') id: string) {
        return this.playersService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create player' })
    @ApiCreatedResponse({ description: 'Player created successfully.' })
    @ApiConflictResponse({ description: 'Player nick already registered.' })
    create(@Body() createPlayerDto: CreatePlayerDto) {
        return this.playersService.create(createPlayerDto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update player' })
    @ApiOkResponse({ description: 'Player updated successfully.' })
    @ApiNotFoundResponse({ description: 'Player not found.' })
    @ApiConflictResponse({ description: 'Player nick already registered.' })
    update(@Param('id') id: string, @Body() updatePlayerDto: UpdatePlayerDto) {
        return this.playersService.update(id, updatePlayerDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete player' })
    @ApiOkResponse({ description: 'Player deleted successfully.' })
    @ApiNotFoundResponse({ description: 'Player not found.' })
    remove(@Param('id') id: string) {
        return this.playersService.remove(id);
    }
}
