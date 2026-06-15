import { Test, TestingModule } from '@nestjs/testing';
import { OwnedPokemonsService } from './owned-pokemons.service';

describe('OwnedPokemonsService', () => {
  let service: OwnedPokemonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OwnedPokemonsService],
    }).compile();

    service = module.get<OwnedPokemonsService>(OwnedPokemonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
