import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Box } from '@prisma/client';

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class BoxesService {
  constructor(private readonly prisma: PrismaService) {}

  // 📦 CREATE BOX
  async create(
    data: { name: string; description: string; rackId: string },
    user: UserPayload,
  ): Promise<Box> {
    // 🔍 cek rack
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const rack = await this.prisma.rack.findUnique({
      where: { id: data.rackId },
    });

    if (!rack) {
      throw new NotFoundException('Rack not found');
    }

    // 🔐 hanya admin pemilik rack
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (user.role === 'admin_rack' && rack.userId !== user.id) {
      throw new BadRequestException('You can only use your own rack');
    }

    // ❗ rack harus active
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (rack.status !== 'active') {
      throw new BadRequestException('Rack is not active');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.box.create({
      data: {
        name: data.name,
        description: data.description,
        rackId: data.rackId,
      },
    });
  }

  // 📦 GET ALL BOXES (super admin)
  findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.box.findMany({
      include: {
        rack: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // 📦 GET BOX BY RACK
  async findByRack(rackId: string, user: UserPayload) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const rack = await this.prisma.rack.findUnique({
      where: { id: rackId },
    });

    if (!rack) {
      throw new NotFoundException('Rack not found');
    }

    // 🔐 admin hanya bisa lihat rack sendiri
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (user.role === 'admin_rack' && rack.userId !== user.id) {
      throw new BadRequestException('Access denied');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.box.findMany({
      where: { rackId },
    });
  }

  // 📦 UPDATE BOX
  async update(
    id: string,
    data: { name?: string; description?: string },
    user: UserPayload,
  ): Promise<Box> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const box = await this.prisma.box.findUnique({
      where: { id },
      include: { rack: true },
    });

    if (!box) {
      throw new NotFoundException('Box not found');
    }

    // 🔐 admin hanya boleh edit miliknya
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (user.role === 'admin_rack' && box.rack.userId !== user.id) {
      throw new BadRequestException('Access denied');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.box.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
      },
    });
  }

  // 📦 DELETE BOX
  async remove(id: string, user: UserPayload): Promise<Box> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const box = await this.prisma.box.findUnique({
      where: { id },
      include: { rack: true },
    });

    if (!box) {
      throw new NotFoundException('Box not found');
    }

    // 🔐 admin hanya boleh hapus miliknya
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (user.role === 'admin_rack' && box.rack.userId !== user.id) {
      throw new BadRequestException('Access denied');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.box.delete({
      where: { id },
    });
  }
}
