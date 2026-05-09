import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatusRack, Divisi } from '@prisma/client';
import { UpdateRackDto } from './dto/update-rack.dto';
@Injectable()
export class RackService {
  constructor(private prisma: PrismaService) {}

  private async generateRackCode() {
    const racks = await this.prisma.rack.findMany({
      select: {
        kode_rack: true,
      },
      orderBy: {
        kode_rack: 'asc',
      },
    });

    const usedNumbers = racks
      .map((rack) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const match = rack.kode_rack.match(/\d+/);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        return match ? parseInt(match[0], 10) : null;
      })
      .filter((n): n is number => n !== null)
      .sort((a, b) => a - b);

    let nextNumber = 1;

    for (const num of usedNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }

    return `RACK-${nextNumber.toString().padStart(3, '0')}`;
  }

  async createRack(userId: string, divisi: Divisi) {
    const kode_rack = await this.generateRackCode();

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
      where: { id, userId },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    return this.prisma.rack.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: dto,
    });
  }

  async deleteRack(id: string, userId: string) {
    const rack = await this.prisma.rack.findFirst({
      where: { id, userId },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    return this.prisma.rack.delete({
      where: { id },
    });
  }

  async approveRack(id: string) {
    const rack = await this.prisma.rack.findUnique({
      where: { id },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    return this.prisma.rack.update({
      where: { id },
      data: {
        status: StatusRack.active,
      },
    });
  }

  async rejectRack(id: string) {
    const rack = await this.prisma.rack.findUnique({
      where: { id },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    return this.prisma.rack.update({
      where: { id },
      data: {
        status: StatusRack.inactive,
      },
    });
  }
}
