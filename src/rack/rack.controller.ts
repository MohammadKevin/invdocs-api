import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { RackService } from './rack.service';
import { UpdateRackDto } from './dto/update-rack.dto';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/Decorators/roles.decorator';

import { Role } from '@prisma/client';

@ApiTags('Rack')
@ApiBearerAuth()
@Controller('rack')
@UseGuards(JwtAuthGuard)
export class RackController {
  constructor(private readonly rackService: RackService) {}

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(Role.super_admin)
  findPending() {
    return this.rackService.findPending();
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.super_admin)
  approve(@Param('id') id: string) {
    return this.rackService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.super_admin)
  reject(@Param('id') id: string) {
    return this.rackService.reject(id);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(Role.admin_rack)
  findMyRacks(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.rackService.findMyRacks(req.user.id);
  }

  @Get('divisi')
  findAllDivisionRacks() {
    return this.rackService.findAllDivisionRacks();
  }

  @Patch(':id/update')
  @UseGuards(RolesGuard)
  @Roles(Role.admin_rack)
  update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateRackDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.rackService.updateRack(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.admin_rack)
  delete(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.rackService.deleteRack(id, req.user.id);
  }

  @Get()
  findAllRacks() {
    return this.rackService.findAllRacks();
  }
}
