import { Test, TestingModule } from '@nestjs/testing';
import { RackService } from './rack.service';

describe('RackService', () => {
  let service: RackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RackService],
    }).compile();

    service = module.get<RackService>(RackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
