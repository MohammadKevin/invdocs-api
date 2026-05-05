import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RackService } from './rack.service';
import { UpdateRackDto } from './dto/update-rack.dto';

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

@ApiTags('Rack')
@ApiBearerAuth()
@Controller('rack')
export class RackController {
  constructor(private readonly rackService: RackService) {}

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.super_admin)
  @ApiOperation({ summary: 'List rack pending (super admin)' })
  findPending() {
    return this.rackService.findPending();
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.super_admin)
  @ApiOperation({ summary: 'Approve rack' })
  @ApiParam({
    name: 'id',
    example: 'c0a8012e-7f3c-4d9a-9b3f-123456789abc',
  })
  approve(@Param('id') id: string) {
    return this.rackService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.super_admin)
  @ApiOperation({ summary: 'Reject rack' })
  @ApiParam({
    name: 'id',
    example: 'c0a8012e-7f3c-4d9a-9b3f-123456789abc',
  })
  reject(@Param('id') id: string) {
    return this.rackService.reject(id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_rack)
  @ApiOperation({ summary: 'Get profile rack (admin rack)' })
  getProfile(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.rackService.getProfile(req.user.sub);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_rack)
  @ApiOperation({ summary: 'Update profile rack (admin rack)' })
  @ApiBody({ type: UpdateRackDto })
  updateProfile(@Req() req: any, @Body() dto: UpdateRackDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.rackService.updateProfile(req.user.sub, dto);
  }
}
