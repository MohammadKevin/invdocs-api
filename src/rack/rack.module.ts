import { Module } from '@nestjs/common';
import { RackService } from './rack.service';
import { RackController } from './rack.controller';

@Module({
  providers: [RackService],
  controllers: [RackController],
  exports: [RackService],
})
export class RackModule {}
