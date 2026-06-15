import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatusHistoryController } from './order-status-history.controller';

describe('OrderStatusHistoryController', () => {
  let controller: OrderStatusHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderStatusHistoryController],
    }).compile();

    controller = module.get<OrderStatusHistoryController>(OrderStatusHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
