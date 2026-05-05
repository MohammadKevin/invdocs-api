import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusRack, Rack } from '@prisma/client';

// 🔐 type user dari JWT
interface UserPayload {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class RackService {
  constructor(private readonly prisma: PrismaService) {}

  // 🔥 helper biar tidak repeat
  private async findRackOrThrow(id: string): Promise<Rack> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const rack = await this.prisma.rack.findUnique({
      where: { id },
    });

    if (!rack) {
      throw new NotFoundException('Rack not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return rack;
  }

  // ✅ CREATE
  create(data: { name: string }, user: UserPayload) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.rack.create({
      data: {
        name: data.name,
        status: StatusRack.pending,
        userId: user.id,
      },
    });
  }

  // ✅ SUPER ADMIN lihat semua
  findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.rack.findMany({
      include: {
        user: true,
        approver: true,
      },
    });
  }

  // ✅ ADMIN lihat miliknya
  findByUser(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.rack.findMany({
      where: { userId },
    });
  }

  // ✅ APPROVE
  async approve(id: string, adminId: string) {
    const rack = await this.findRackOrThrow(id);

    if (rack.status !== StatusRack.pending) {
      throw new BadRequestException('Rack already processed');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.rack.update({
      where: { id },
      data: {
        status: StatusRack.active,
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });
  }

  // ✅ REJECT
  async reject(id: string, adminId: string) {
    const rack = await this.findRackOrThrow(id);

    if (rack.status !== StatusRack.pending) {
      throw new BadRequestException('Rack already processed');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.rack.update({
      where: { id },
      data: {
        status: StatusRack.inactive,
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });
  }

  // ✅ UPDATE
  async update(id: string, data: { name?: string }, user: UserPayload) {
    const rack = await this.findRackOrThrow(id);

    // 🔐 AUTHORIZATION
    if (user.role === 'admin_rack' && rack.userId !== user.id) {
      throw new BadRequestException('You can only update your own rack');
    }

    // ❗ hanya boleh saat pending
    if (rack.status !== StatusRack.pending) {
      throw new BadRequestException(
        'Cannot update rack after approval/rejection',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.rack.update({
      where: { id },
      data: {
        name: data.name,
      },
    });
  }
}
