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

  @Get('pending')
  findPending() {
    return this.rackService.findPending();
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.super_admin)
  findAllAdminRacks() {
    return this.rackService.findAllAdminRacks();
  }

  @Get()
  findAll() {
    return this.rackService.findAllRacks();
  }

  @Get('divisi')
  findAllDivisions() {
    return this.rackService.findAllDivisionRacks();
  }

  @Get('divisi/:divisi')
  findByDivision(
    @Param('divisi')
    divisi: string,
  ) {
    if (!Object.values(Divisi).includes(divisi as Divisi)) {
      throw new BadRequestException('Divisi tidak valid');
    }

    return this.rackService.findRackByDivision(divisi as Divisi);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(Role.admin_rack)
  findMy(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.rackService.findMyRacks(req.user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.admin_rack)
  update(
    @Param('id') id: string,

    @Req() req: any,

    @Body()
    dto: UpdateRackDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.rackService.updateRack(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.super_admin, Role.admin_rack)
  delete(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (req.user.role === Role.super_admin) {
      return this.rackService.deleteRack(id);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.rackService.deleteRack(id, req.user.id);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.super_admin)
  approve(@Param('id') id: string) {
    return this.rackService.approveRack(id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.super_admin)
  reject(@Param('id') id: string) {
    return this.rackService.rejectRack(id);
  }
}
