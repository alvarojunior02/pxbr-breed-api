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
import { CreateOwnedPokemonDto } from './dto/create-owned-pokemon.dto';
import { FindOwnedPokemonsQueryDto } from './dto/find-owned-pokemons-query.dto';
import { UpdateOwnedPokemonDto } from './dto/update-owned-pokemon.dto';
import { OwnedPokemonsService } from './owned-pokemons.service';

@ApiTags('Owned Pokémons')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing access token.' })
@UseGuards(JwtAuthGuard)
@Controller('owned-pokemons')
export class OwnedPokemonsController {
    constructor(private readonly ownedPokemonsService: OwnedPokemonsService) {}

    @Get()
    @ApiOperation({ summary: 'List owned Pokémons' })
    @ApiOkResponse({ description: 'Returns owned Pokémons list.' })
    findAll(@Query() query: FindOwnedPokemonsQueryDto) {
        return this.ownedPokemonsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get owned Pokémon by id' })
    @ApiOkResponse({ description: 'Returns selected owned Pokémon.' })
    @ApiNotFoundResponse({ description: 'Owned Pokémon not found.' })
    findOne(@Param('id') id: string) {
        return this.ownedPokemonsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create owned Pokémon' })
    @ApiCreatedResponse({ description: 'Owned Pokémon created successfully.' })
    create(@Body() createOwnedPokemonDto: CreateOwnedPokemonDto) {
        return this.ownedPokemonsService.create(createOwnedPokemonDto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update owned Pokémon' })
    @ApiOkResponse({ description: 'Owned Pokémon updated successfully.' })
    @ApiNotFoundResponse({ description: 'Owned Pokémon not found.' })
    update(
        @Param('id') id: string,
        @Body() updateOwnedPokemonDto: UpdateOwnedPokemonDto,
    ) {
        return this.ownedPokemonsService.update(id, updateOwnedPokemonDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete owned Pokémon' })
    @ApiOkResponse({ description: 'Owned Pokémon deleted successfully.' })
    @ApiNotFoundResponse({ description: 'Owned Pokémon not found.' })
    remove(@Param('id') id: string) {
        return this.ownedPokemonsService.remove(id);
    }
}
