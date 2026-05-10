import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { Document, Role, DocumentStatus } from '@prisma/client';

import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

interface JwtUser {
  id: string;
  role: Role;
}

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    fileUrl: string,
    file: Express.Multer.File,
    dto: CreateDocumentDto,
    user: JwtUser,
  ): Promise<Document> {
    if (!fileUrl) {
      throw new BadRequestException('File wajib diupload');
    }

    const box = await this.prisma.box.findUnique({
      where: { id: dto.boxId },
    });

    if (!box) {
      throw new NotFoundException('Box tidak ditemukan');
    }

    return this.prisma.document.create({
      data: {
        title: dto.title,
        description: dto.description,
        fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        status: DocumentStatus.pending,
        uploadedBy: user.id,
        boxId: dto.boxId,
      },
    });
  }

  async findAll() {
    return this.prisma.document.findMany({
      include: {
        user: true,

        box: {
          include: {
            rack: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findMyDocuments(user: JwtUser) {
    return this.prisma.document.findMany({
      where: {
        uploadedBy: user.id,
      },

      include: {
        box: {
          include: {
            rack: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Document> {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        box: {
          include: { rack: true },
        },
      },
    });

    if (!doc) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    return doc;
  }

  async update(id: string, dto: UpdateDocumentDto, user: JwtUser) {
    const doc = await this.prisma.document.findUnique({ where: { id } });

    if (!doc) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    if (doc.uploadedBy !== user.id) {
      throw new ForbiddenException('Akses ditolak');
    }

    if (doc.status !== DocumentStatus.pending) {
      throw new BadRequestException('Dokumen sudah diproses');
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
      },
    });
  }

  async remove(id: string, user: JwtUser) {
    const doc = await this.prisma.document.findUnique({ where: { id } });

    if (!doc) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    if (doc.uploadedBy !== user.id) {
      throw new ForbiddenException('Akses ditolak');
    }

    return this.prisma.document.delete({ where: { id } });
  }

  async approve(id: string, user: JwtUser) {
    this.ensureAdmin(user);

    const doc = await this.prisma.document.findUnique({ where: { id } });

    if (!doc) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        status: DocumentStatus.approved,
        verifiedBy: user.id,
      },
    });
  }

  async reject(id: string, user: JwtUser) {
    this.ensureAdmin(user);

    const doc = await this.prisma.document.findUnique({ where: { id } });

    if (!doc) {
      throw new NotFoundException('Dokumen tidak ditemukan');
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        status: DocumentStatus.rejected,
        verifiedBy: user.id,
      },
    });
  }

  private ensureAdmin(user: JwtUser) {
    const allowed: Role[] = [Role.admin_rack, Role.super_admin];

    if (!allowed.includes(user.role)) {
      throw new ForbiddenException('Akses admin diperlukan');
    }
  }
}
