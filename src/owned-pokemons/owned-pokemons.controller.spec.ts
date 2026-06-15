import { Test, TestingModule } from '@nestjs/testing';
import { OwnedPokemonsController } from './owned-pokemons.controller';

describe('OwnedPokemonsController', () => {
  let controller: OwnedPokemonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnedPokemonsController],
    }).compile();

    controller = module.get<OwnedPokemonsController>(OwnedPokemonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
