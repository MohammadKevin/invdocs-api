import { Module } from '@nestjs/common';
import { RackService } from './rack.service';
import { RackController } from './rack.controller';

@Module({
  providers: [RackService],
  controllers: [RackController]
})
export class RackModule {}
