import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRackDto } from './dto/update-rack.dto';
import { StatusRack } from '@prisma/client';

@Injectable()
export class RackService {
  constructor(private readonly prisma: PrismaService) {}

  async findPending() {
    return this.prisma.rack.findMany({
      where: { status: StatusRack.pending },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
  async approve(id: string) {
    const rack = await this.prisma.rack.findUnique({
      where: { id },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    return this.prisma.rack.update({
      where: { id },
      data: { status: StatusRack.active },
    });
  }

  async reject(id: string) {
    const rack = await this.prisma.rack.findUnique({
      where: { id },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    return this.prisma.rack.update({
      where: { id },
      data: { status: StatusRack.inactive },
    });
  }

  async getProfile(userId: string) {
    const rack = await this.prisma.rack.findFirst({
      where: { userId },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    return rack;
  }

  async updateProfile(userId: string, dto: UpdateRackDto) {
    const rack = await this.prisma.rack.findFirst({
      where: { userId },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    return this.prisma.rack.update({
      where: { id: rack.id },
      data: {
        ...(dto.name_rack && { name_rack: dto.name_rack }),
      },
    });
  }
}
