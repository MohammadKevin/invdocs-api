import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { Prisma, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,

        racks: {
          select: {
            id: true,
            kode_rack: true,
            divisi: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,

        racks: {
          select: {
            id: true,
            kode_rack: true,
            divisi: true,
            status: true,
            createdAt: true,
          },
        },

        documents: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  findByRole(role: Role) {
    return this.prisma.user.findMany({
      where: {
        role,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
