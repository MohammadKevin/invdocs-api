import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.usersService.findAll();
  }
  @Get(':id')
  findById(@Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.usersService.findById(id);
  }

  @Get('role/:role')
  findByRole(@Param('role') role: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.usersService.findByRole(role as any);
  }
}
