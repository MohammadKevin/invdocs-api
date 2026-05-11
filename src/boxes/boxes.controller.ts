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
import { UpdateBoxDto } from './dto/update-service.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/Decorators/roles.decorator';
import { Role } from '@prisma/client';
interface JwtUser {
  id: string;
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
  create(@Body() dto: CreateBoxDto, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;

    return this.boxesService.create(dto, user);
  }

  @Get()
  @Roles(Role.super_admin, Role.admin_rack, Role.user)
  findAll() {
    return this.boxesService.findAll();
  }

  @Get('rack/:rackId')
  @Roles(Role.super_admin, Role.admin_rack, Role.user)
  findByRack(
    @Param('rackId')
    rackId: string,

    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;

    return this.boxesService.findByRack(rackId, user);
  }

  @Get(':id')
  @Roles(Role.super_admin, Role.admin_rack, Role.user)
  findOne(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;

    return this.boxesService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.admin_rack)
  update(
    @Param('id') id: string,

    @Body()
    dto: UpdateBoxDto,

    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;

    return this.boxesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.admin_rack)
  remove(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;

    return this.boxesService.remove(id, user);
  }
}
