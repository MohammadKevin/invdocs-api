import { Test, TestingModule } from '@nestjs/testing';
import { RackController } from './rack.controller';

describe('RackController', () => {
  let controller: RackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RackController],
    }).compile();

    controller = module.get<RackController>(RackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
