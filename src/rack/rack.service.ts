import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { StatusRack, Divisi } from '@prisma/client';

import { UpdateRackDto } from './dto/update-rack.dto';

@Injectable()
export class RackService {
  constructor(private prisma: PrismaService) {}

  private async generateRackCode(divisi: Divisi): Promise<string> {
    console.log('Generating for divisi:', divisi); // ← cek value masuk

    const racks = await this.prisma.rack.findMany({
      where: { divisi },
      select: { kode_rack: true },
    });

    console.log('Existing racks for this divisi:', racks); // ← harusnya kosong untuk Finance

    const usedNumbers = new Set<number>();

    for (const rack of racks) {
      const match = rack.kode_rack.match(/(\d+)$/);
      if (match) {
        usedNumbers.add(parseInt(match[1], 10));
      }
    }

    console.log('Used numbers:', [...usedNumbers]); // ← kalau Finance harusnya []

    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) {
      nextNumber++;
    }

    return `RACK-${String(nextNumber).padStart(3, '0')}`;
  }

  async createRack(userId: string, divisi: Divisi) {
    const kode_rack = await this.generateRackCode(divisi);

    return this.prisma.rack.create({
      data: {
        kode_rack,
        divisi,
        userId,
      },
    });
  }

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

  async findAllAdminRacks() {
    return this.prisma.rack.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        boxes: true,
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
      where: {
        userId,
      },
      include: {
        boxes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllDivisionRacks() {
    return this.prisma.rack.findMany({
      where: {
        status: StatusRack.active,
      },
      select: {
        id: true,
        kode_rack: true,
        divisi: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findRackByDivision(divisi: Divisi) {
    return this.prisma.rack.findMany({
      where: {
        divisi,
        status: StatusRack.active,
      },
      select: {
        id: true,
        kode_rack: true,
        divisi: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateRack(id: string, userId: string, dto: UpdateRackDto) {
    const rack = await this.prisma.rack.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    return this.prisma.rack.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async deleteRack(id: string, userId?: string) {
    const rack = userId
      ? await this.prisma.rack.findFirst({
          where: {
            id,
            userId,
          },
        })
      : await this.prisma.rack.findUnique({
          where: {
            id,
          },
        });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    return this.prisma.rack.delete({
      where: {
        id,
      },
    });
  }

  async approveRack(id: string) {
    const rack = await this.prisma.rack.findUnique({
      where: {
        id,
      },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    return this.prisma.rack.update({
      where: {
        id,
      },
      data: {
        status: StatusRack.active,
      },
    });
  }

  async rejectRack(id: string) {
    const rack = await this.prisma.rack.findUnique({
      where: {
        id,
      },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    return this.prisma.rack.update({
      where: {
        id,
      },
      data: {
        status: StatusRack.inactive,
      },
    });
  }
}
