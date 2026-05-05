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

import { UserService } from './users.service';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/Decorators/roles.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 👤 CREATE USER (register / admin create)
  @Post()
  @Roles('super_admin')
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  // 👤 GET ALL USERS
  @Get()
  @Roles('super_admin')
  findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.userService.findAll();
  }

  // 👤 GET BY ID
  @Get(':id')
  @Roles('super_admin')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.findOne(id);
  }

  // 👤 UPDATE USER
  @Patch(':id')
  @Roles('super_admin')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.userService.update(id, body);
  }

  // 👤 DELETE USER
  @Delete(':id')
  @Roles('super_admin')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.remove(id);
  }
}
