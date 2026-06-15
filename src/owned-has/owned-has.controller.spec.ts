import { Test, TestingModule } from '@nestjs/testing';
import { OwnedHasController } from './owned-has.controller';

describe('OwnedHasController', () => {
  let controller: OwnedHasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnedHasController],
    }).compile();

    controller = module.get<OwnedHasController>(OwnedHasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
