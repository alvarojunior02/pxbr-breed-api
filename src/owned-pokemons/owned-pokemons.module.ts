import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnedPokemon } from './entities/owned-pokemon.entity';
import { OwnedPokemonsController } from './owned-pokemons.controller';
import { OwnedPokemonsService } from './owned-pokemons.service';

@Module({
    imports: [TypeOrmModule.forFeature([OwnedPokemon])],
    controllers: [OwnedPokemonsController],
    providers: [OwnedPokemonsService],
    exports: [OwnedPokemonsService],
})
export class OwnedPokemonsModule {}
