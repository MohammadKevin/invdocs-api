import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';

import type { Response } from 'express';

import { ReportsService } from './reports.service';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/Decorators/roles.decorator';

import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles(Role.super_admin, Role.admin_rack)
  dashboard() {
    return this.reportsService.dashboardSummary();
  }

  @Get('monthly')
  @Roles(Role.super_admin, Role.admin_rack)
  monthly(@Query('year') year: string) {
    return this.reportsService.monthlyReport(Number(year));
  }

  @Get('yearly')
  @Roles(Role.super_admin, Role.admin_rack)
  yearly() {
    return this.reportsService.yearlyReport();
  }

  @Get('division')
  @Roles(Role.super_admin, Role.admin_rack)
  division() {
    return this.reportsService.divisionReport();
  }

  @Get('status')
  @Roles(Role.super_admin, Role.admin_rack)
  status() {
    return this.reportsService.documentStatusReport();
  }

  @Get('rack')
  @Roles(Role.super_admin, Role.admin_rack)
  rack() {
    return this.reportsService.rackReport();
  }

  @Get('box')
  @Roles(Role.super_admin, Role.admin_rack)
  box() {
    return this.reportsService.boxReport();
  }

  @Get('export')
  @Roles(Role.super_admin, Role.admin_rack)
  async exportExcel(
    @Query('type') type: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('startMonth') startMonth?: string,
    @Query('endMonth') endMonth?: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Res() res?: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const buffer = await this.reportsService.exportExcel({
      type,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      startMonth: startMonth ? Number(startMonth) : undefined,
      endMonth: endMonth ? Number(endMonth) : undefined,
      start,
      end,
    });

    res?.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res?.setHeader(
      'Content-Disposition',
      `attachment; filename=report-${Date.now()}.xlsx`,
    );

    res?.send(buffer);
  }
}
