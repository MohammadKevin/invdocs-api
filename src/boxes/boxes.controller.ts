import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { BoxesService } from './boxes.service';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/Decorators/roles.decorator';
import { CurrentUser } from '../auth/Decorators/current-user.decorator';

import { CreateBoxDto } from './dto/create-boxes.dto';
import { UpdateBoxDto } from './dto/update-boxes.dto';

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

@Controller('boxes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BoxesController {
  constructor(private readonly boxesService: BoxesService) {}

  // 📦 CREATE BOX (admin_rack)
  @Post()
  @Roles('admin_rack')
  create(@Body() body: CreateBoxDto, @CurrentUser() user: UserPayload) {
    return this.boxesService.create(body, user);
  }

  // 📦 GET ALL BOXES (super_admin)
  @Get()
  @Roles('super_admin')
  findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.boxesService.findAll();
  }

  // 📦 GET BOX BY RACK (admin_rack / super_admin)
  @Get('rack/:rackId')
  @Roles('admin_rack', 'super_admin')
  findByRack(
    @Param('rackId', new ParseUUIDPipe()) rackId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.boxesService.findByRack(rackId, user);
  }

  // 📦 UPDATE BOX
  @Patch(':id')
  @Roles('admin_rack', 'super_admin')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateBoxDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.boxesService.update(id, body, user);
  }

  // 📦 DELETE BOX
  @Delete(':id')
  @Roles('admin_rack', 'super_admin')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.boxesService.remove(id, user);
  }
}
