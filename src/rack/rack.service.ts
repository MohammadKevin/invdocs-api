import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { StatusRack } from '@prisma/client';

import { UpdateRackDto } from './dto/update-rack.dto';

@Injectable()
export class RackService {
  constructor(private prisma: PrismaService) {}

  async findPending() {
    return this.prisma.rack.findMany({
      where: {
        status: StatusRack.pending,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
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
      where: {
        id,
      },

      data: {
        status: StatusRack.active,
      },
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
      where: {
        id,
      },

      data: {
        status: StatusRack.inactive,
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

  async deleteRack(id: string, userId: string) {
    const rack = await this.prisma.rack.findFirst({
      where: {
        id,
        userId,
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

  async findAllRacks() {
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
}
