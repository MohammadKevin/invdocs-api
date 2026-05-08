import {
  Controller,
  Get,
  Param,
  UseGuards,
  Patch,
  Delete,
  Body,
  Req,
} from '@nestjs/common';

import { RackService } from './rack.service';
import { UpdateRackDto } from './dto/update-rack.dto';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/Decorators/roles.decorator';

import { Role } from '@prisma/client';

@Controller('rack')
@UseGuards(JwtAuthGuard)
export class RackController {
  constructor(private readonly rackService: RackService) {}

  @Get('divisi')
  findAllDivisions() {
    return this.rackService.findAllDivisionRacks();
  }

  @Get('divisi/:divisi')
  findByDivision(@Param('divisi') divisi: string) {
    return this.rackService.findRackByDivision(divisi);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(Role.admin_rack)
  findMy(@Req() req: any) {
    return this.rackService.findMyRacks(req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateRackDto) {
    return this.rackService.updateRack(id, req.user.id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    return this.rackService.deleteRack(id, req.user.id);
  }

  @Get()
  findAll() {
    return this.rackService.findAllRacks();
  }
}
