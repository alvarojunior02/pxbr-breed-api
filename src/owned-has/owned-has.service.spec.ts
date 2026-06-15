import { Test, TestingModule } from '@nestjs/testing';
import { OwnedHasService } from './owned-has.service';

describe('OwnedHasService', () => {
  let service: OwnedHasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OwnedHasService],
    }).compile();

    service = module.get<OwnedHasService>(OwnedHasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
