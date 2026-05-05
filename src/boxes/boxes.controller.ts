import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';

import { BoxesService } from './boxes.service';
import { CreateBoxDto } from './dto/create-boxes.dto';
import { UpdateBoxDto } from './dto//update-service.dto';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/Decorators/roles.decorator';

import { Role } from '@prisma/client';

interface JwtUser {
  sub: string;
  email: string;
  role: Role;
}

@ApiTags('Boxes')
@ApiBearerAuth()
@Controller('boxes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BoxesController {
  constructor(private readonly boxesService: BoxesService) {}

  @Post()
  @Roles(Role.admin_rack)
  @ApiOperation({ summary: 'Create box (admin rack only)' })
  @ApiBody({ type: CreateBoxDto })
  create(@Body() dto: CreateBoxDto, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.boxesService.create(dto, user);
  }

  @Get()
  @Roles(Role.super_admin, Role.admin_rack, Role.user)
  @ApiOperation({ summary: 'Get all boxes (super admin)' })
  findAll(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.boxesService.findAll(user);
  }

  @Get('rack/:rackId')
  @Roles(Role.super_admin, Role.admin_rack, Role.user)
  @ApiOperation({ summary: 'Get boxes by rack' })
  @ApiParam({
    name: 'rackId',
    example: 'c0a8012e-7f3c-4d9a-9b3f-123456789abc',
  })
  findByRack(@Param('rackId') rackId: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.boxesService.findByRack(rackId, user);
  }

  @Get(':id')
  @Roles(Role.super_admin, Role.admin_rack, Role.user)
  @ApiOperation({ summary: 'Get detail box' })
  @ApiParam({
    name: 'id',
    example: 'c0a8012e-7f3c-4d9a-9b3f-123456789abc',
  })
  findOne(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.boxesService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.admin_rack)
  @ApiOperation({ summary: 'Update box (admin rack only)' })
  @ApiParam({
    name: 'id',
    example: 'c0a8012e-7f3c-4d9a-9b3f-123456789abc',
  })
  @ApiBody({ type: UpdateBoxDto })
  update(@Param('id') id: string, @Body() dto: UpdateBoxDto, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.boxesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.admin_rack)
  @ApiOperation({ summary: 'Delete box (admin rack only)' })
  @ApiParam({
    name: 'id',
    example: 'c0a8012e-7f3c-4d9a-9b3f-123456789abc',
  })
  remove(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.boxesService.remove(id, user);
  }
}
