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
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOwnedHaDto } from './dto/create-owned-ha.dto';
import { FindOwnedHasQueryDto } from './dto/find-owned-has-query.dto';
import { UpdateOwnedHaDto } from './dto/update-owned-ha.dto';
import { OwnedHasService } from './owned-has.service';

@ApiTags('Owned HAs')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing access token.' })
@UseGuards(JwtAuthGuard)
@Controller('owned-has')
export class OwnedHasController {
    constructor(private readonly ownedHasService: OwnedHasService) {}

    @Get()
    @ApiOperation({ summary: 'List owned HAs' })
    @ApiOkResponse({ description: 'Returns owned HAs list.' })
    findAll(@Query() query: FindOwnedHasQueryDto) {
        return this.ownedHasService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get owned HA by id' })
    @ApiOkResponse({ description: 'Returns selected owned HA.' })
    @ApiNotFoundResponse({ description: 'Owned HA not found.' })
    findOne(@Param('id') id: string) {
        return this.ownedHasService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create owned HA' })
    @ApiCreatedResponse({ description: 'Owned HA created successfully.' })
    create(@Body() createOwnedHaDto: CreateOwnedHaDto) {
        return this.ownedHasService.create(createOwnedHaDto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update owned HA' })
    @ApiOkResponse({ description: 'Owned HA updated successfully.' })
    @ApiNotFoundResponse({ description: 'Owned HA not found.' })
    update(
        @Param('id') id: string,
        @Body() updateOwnedHaDto: UpdateOwnedHaDto,
    ) {
        return this.ownedHasService.update(id, updateOwnedHaDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete owned HA' })
    @ApiOkResponse({ description: 'Owned HA deleted successfully.' })
    @ApiNotFoundResponse({ description: 'Owned HA not found.' })
    remove(@Param('id') id: string) {
        return this.ownedHasService.remove(id);
    }
}
