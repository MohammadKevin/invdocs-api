import {
  Controller,
  Get,
  Param,
  UseGuards,
  Patch,
  Delete,
  Req,
  Body,
  BadRequestException,
} from '@nestjs/common';

import { RackService } from './rack.service';
import { UpdateRackDto } from './dto/update-rack.dto';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/Decorators/roles.decorator';

import { Role, Divisi } from '@prisma/client';

@Controller('rack')
@UseGuards(JwtAuthGuard)
export class RackController {
  constructor(private readonly rackService: RackService) {}

  // =========================
  // PENDING RACK (FIX 404)
  // =========================
  @Get('pending')
  findPending() {
    return this.rackService.findPending();
  }

  // =========================
  // ALL RACK
  // =========================
  @Get()
  findAll() {
    return this.rackService.findAllRacks();
  }

  // =========================
  // DIVISI LIST ACTIVE RACK
  // =========================
  @Get('divisi')
  findAllDivisions() {
    return this.rackService.findAllDivisionRacks();
  }

  // =========================
  // DIVISI FILTER (FIX ENUM ERROR)
  // =========================
  @Get('divisi/:divisi')
  findByDivision(@Param('divisi') divisi: string) {
    // validasi enum biar aman
    if (!Object.values(Divisi).includes(divisi as Divisi)) {
      throw new BadRequestException('Divisi tidak valid');
    }

    return this.rackService.findRackByDivision(divisi as Divisi);
  }

  // =========================
  // MY RACK
  // =========================
  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(Role.admin_rack)
  findMy(@Req() req: any) {
    return this.rackService.findMyRacks(req.user.id);
  }

  // =========================
  // UPDATE
  // =========================
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateRackDto) {
    return this.rackService.updateRack(id, req.user.id, dto);
  }

  // =========================
  // DELETE
  // =========================
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    return this.rackService.deleteRack(id, req.user.id);
  }

  // =========================
  // APPROVE RACK
  // =========================
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.rackService.approveRack(id);
  }

  // =========================
  // REJECT RACK
  // =========================
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.rackService.rejectRack(id);
  }
}
