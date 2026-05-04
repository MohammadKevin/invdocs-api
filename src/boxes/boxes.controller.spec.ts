import { Test, TestingModule } from '@nestjs/testing';
import { BoxesController } from './boxes.controller';

describe('BoxesController', () => {
  let controller: BoxesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoxesController],
    }).compile();

    controller = module.get<BoxesController>(BoxesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
