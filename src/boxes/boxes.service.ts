import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Box, Role, StatusRack } from '@prisma/client';
import { CreateBoxDto } from './dto/create-boxes.dto';
import { UpdateBoxDto } from './dto/update-service.dto';

interface JwtUser {
  id: string;
  email: string;
  role: Role;
}

@Injectable()
export class BoxesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateBoxCode(rackId: string) {
    const boxes = await this.prisma.box.findMany({
      where: {
        rackId,
      },
      select: {
        kode_box: true,
      },
    });

    const numbers = boxes
      .map((box) => {
        const parts = box.kode_box.split('-');

        return Number(parts[1]);
      })
      .filter((n) => !isNaN(n));

    let nextNumber = 1;

    while (numbers.includes(nextNumber)) {
      nextNumber++;
    }

    return `BOX-${String(nextNumber).padStart(3, '0')}`;
  }

  async create(dto: CreateBoxDto, user: JwtUser): Promise<Box> {
    const rack = await this.prisma.rack.findUnique({
      where: {
        id: dto.rackId,
      },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    if (user.role !== Role.admin_rack) {
      throw new ForbiddenException('Hanya admin rack yang bisa membuat box');
    }

    if (rack.userId !== user.id) {
      throw new ForbiddenException(
        'Anda hanya bisa menggunakan rack milik sendiri',
      );
    }

    if (rack.status !== StatusRack.active) {
      throw new BadRequestException('Rack belum aktif');
    }

    const kode_box = await this.generateBoxCode(dto.rackId);

    return this.prisma.box.create({
      data: {
        kode_box,
        name_box: dto.name_box,
        description: dto.description,
        rackId: dto.rackId,
      },
    });
  }

  async findAll() {
    return this.prisma.box.findMany({
      include: {
        rack: true,
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByRack(rackId: string, user: JwtUser) {
    const rack = await this.prisma.rack.findUnique({
      where: {
        id: rackId,
      },
    });

    if (!rack) {
      throw new NotFoundException('Rack tidak ditemukan');
    }

    if (user.role === Role.admin_rack && rack.userId !== user.id) {
      throw new ForbiddenException('Akses ditolak');
    }

    return this.prisma.box.findMany({
      where: {
        rackId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, user: JwtUser): Promise<Box> {
    const box = await this.prisma.box.findUnique({
      where: {
        id,
      },
      include: {
        rack: true,
      },
    });

    if (!box) {
      throw new NotFoundException('Box tidak ditemukan');
    }

    if (user.role === Role.admin_rack && box.rack.userId !== user.id) {
      throw new ForbiddenException('Akses ditolak');
    }

    return box;
  }

  async update(id: string, dto: UpdateBoxDto, user: JwtUser): Promise<Box> {
    const box = await this.prisma.box.findUnique({
      where: {
        id,
      },
      include: {
        rack: true,
      },
    });

    if (!box) {
      throw new NotFoundException('Box tidak ditemukan');
    }

    if (user.role === Role.admin_rack && box.rack.userId !== user.id) {
      throw new ForbiddenException('Akses ditolak');
    }

    return this.prisma.box.update({
      where: {
        id,
      },
      data: {
        ...(dto.name_box && {
          name_box: dto.name_box,
        }),

        ...(dto.description && {
          description: dto.description,
        }),
      },
    });
  }

  async remove(id: string, user: JwtUser): Promise<Box> {
    const box = await this.prisma.box.findUnique({
      where: {
        id,
      },
      include: {
        rack: true,
      },
    });

    if (!box) {
      throw new NotFoundException('Box tidak ditemukan');
    }

    if (user.role === Role.admin_rack && box.rack.userId !== user.id) {
      throw new ForbiddenException('Akses ditolak');
    }

    return this.prisma.box.delete({
      where: {
        id,
      },
    });
  }
}
