import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { RackService } from './rack.service';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/Decorators/roles.decorator';
import { CurrentUser } from '../auth/Decorators/current-user.decorator';

import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';

// 🔐 type user dari JWT
interface UserPayload {
  id: string;
  email: string;
  role: string;
}

@Controller('racks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RackController {
  constructor(private readonly rackService: RackService) {}

  // ✅ CREATE → hanya admin_rack
  @Post()
  @Roles('admin_rack')
  create(@Body() body: CreateRackDto, @CurrentUser() user: UserPayload) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.rackService.create(body, user);
  }

  // ✅ SUPER ADMIN lihat semua rack
  @Get()
  @Roles('super_admin')
  findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.rackService.findAll();
  }

  // ✅ ADMIN lihat rack miliknya
  @Get('me')
  @Roles('admin_rack')
  findMyRacks(@CurrentUser() user: UserPayload) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.rackService.findByUser(user.id);
  }

  // ✅ UPDATE RACK (🔥 ditambahkan)
  @Patch(':id')
  @Roles('admin_rack', 'super_admin')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateRackDto,
    @CurrentUser() user: UserPayload, // ❌ jangan pakai any
  ) {
    return this.rackService.update(id, body, user);
  }

  // ✅ APPROVE RACK
  @Patch(':id/approve')
  @Roles('super_admin')
  approve(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.rackService.approve(id, user.id);
  }

  // ✅ REJECT RACK
  @Patch(':id/reject')
  @Roles('super_admin')
  reject(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.rackService.reject(id, user.id);
  }
}
