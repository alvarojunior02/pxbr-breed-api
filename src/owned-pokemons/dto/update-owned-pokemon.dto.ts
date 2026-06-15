import { PartialType } from '@nestjs/swagger';
import { CreateOwnedPokemonDto } from './create-owned-pokemon.dto';

export class UpdateOwnedPokemonDto extends PartialType(CreateOwnedPokemonDto) {}
