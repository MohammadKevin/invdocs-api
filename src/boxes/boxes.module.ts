import { Module } from '@nestjs/common';
import { BoxesService } from './boxes.service';
import { BoxesController } from './boxes.controller';

@Module({
  providers: [BoxesService],
  controllers: [BoxesController],
  exports: [BoxesService],
})
export class BoxesModule {}
