import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { StatusRack, Divisi } from '@prisma/client';
import { UpdateRackDto } from './dto/update-rack.dto';

@Injectable()
export class RackService {
  constructor(private prisma: PrismaService) {}

  async findPending() {
    return this.prisma.rack.findMany({
      where: {
        status: StatusRack.pending,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllRacks() {
    return this.prisma.rack.findMany({
      include: {
        user: true,
        boxes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findMyRacks(userId: string) {
    return this.prisma.rack.findMany({
      where: { userId },
      include: { boxes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllDivisionRacks() {
    return this.prisma.rack.findMany({
      where: { status: StatusRack.active },
      select: {
        id: true,
        name_rack: true,
        divisi: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ FIX TYPE ERROR: Divisi enum
  async findRackByDivision(divisi: Divisi) {
    return this.prisma.rack.findMany({
      where: {
        divisi,
        status: StatusRack.active,
      },
      select: {
        id: true,
        name_rack: true,
        divisi: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRack(id: string, userId: string, dto: UpdateRackDto) {
    const rack = await this.prisma.rack.findFirst({
      where: { id, userId },
    });

    if (!rack) throw new NotFoundException('Rack tidak ditemukan');

    return this.prisma.rack.update({
      where: { id },
      data: dto,
    });
  }

  async deleteRack(id: string, userId: string) {
    const rack = await this.prisma.rack.findFirst({
      where: { id, userId },
    });

    if (!rack) throw new NotFoundException('Rack tidak ditemukan');

    return this.prisma.rack.delete({
      where: { id },
    });
  }

  // =========================
  // ✅ APPROVE / REJECT RACK
  // =========================

  async approveRack(id: string) {
    const rack = await this.prisma.rack.findUnique({ where: { id } });

    if (!rack) throw new NotFoundException('Rack tidak ditemukan');

    return this.prisma.rack.update({
      where: { id },
      data: {
        status: StatusRack.active,
      },
    });
  }

  async rejectRack(id: string) {
    const rack = await this.prisma.rack.findUnique({ where: { id } });

    if (!rack) throw new NotFoundException('Rack tidak ditemukan');

    return this.prisma.rack.update({
      where: { id },
      data: {
        status: StatusRack.inactive,
      },
    });
  }
}
