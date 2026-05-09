import { Injectable, BadRequestException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentStatus } from '@prisma/client';

import * as ExcelJS from 'exceljs';

interface ExportExcelParams {
  type: string;
  year?: number;
  month?: number;
  startMonth?: number;
  endMonth?: number;
  start?: string;
  end?: string;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboardSummary() {
    const [
      totalDocuments,
      totalRacks,
      totalBoxes,
      approvedDocuments,
      pendingDocuments,
      rejectedDocuments,
    ] = await Promise.all([
      this.prisma.document.count(),

      this.prisma.rack.count(),

      this.prisma.box.count(),

      this.prisma.document.count({
        where: {
          status: DocumentStatus.approved,
        },
      }),

      this.prisma.document.count({
        where: {
          status: DocumentStatus.pending,
        },
      }),

      this.prisma.document.count({
        where: {
          status: DocumentStatus.rejected,
        },
      }),
    ]);

    return {
      totalDocuments,
      totalRacks,
      totalBoxes,
      approvedDocuments,
      pendingDocuments,
      rejectedDocuments,
    };
  }

  async monthlyReport(year: number) {
    const documents = await this.prisma.document.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59)),
        },
      },
      select: {
        createdAt: true,
      },
    });

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];

    const result = months.map((month) => ({
      month,
      total: 0,
    }));

    documents.forEach((doc) => {
      const monthIndex = new Date(doc.createdAt).getMonth();
      result[monthIndex].total++;
    });

    return result;
  }

  async yearlyReport() {
    const documents = await this.prisma.document.findMany({
      select: {
        createdAt: true,
      },
    });

    const map = new Map<number, number>();

    documents.forEach((doc) => {
      const year = new Date(doc.createdAt).getFullYear();

      map.set(year, (map.get(year) || 0) + 1);
    });

    return Array.from(map.entries()).map(([year, total]) => ({
      year,
      total,
    }));
  }

  async divisionReport() {
    const divisions = await this.prisma.rack.groupBy({
      by: ['divisi'],
      _count: {
        id: true,
      },
    });

    return divisions.map((division) => ({
      divisi: division.divisi,
      total: division._count.id,
    }));
  }

  async documentStatusReport() {
    const statuses = await this.prisma.document.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    return statuses.map((status) => ({
      status: status.status,
      total: status._count.id,
    }));
  }

  async rackReport() {
    const racks = await this.prisma.rack.findMany({
      include: {
        boxes: {
          include: {
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return racks.map((rack) => {
      const totalBoxes = rack.boxes.length;

      const totalDocuments = rack.boxes.reduce(
        (acc, box) => acc + box.documents.length,
        0,
      );

      return {
        id: rack.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        kode_rack: rack.kode_rack,
        divisi: rack.divisi,
        status: rack.status,
        totalBoxes,
        totalDocuments,
        createdAt: rack.createdAt,
      };
    });
  }

  async boxReport() {
    const boxes = await this.prisma.box.findMany({
      include: {
        rack: true,
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return boxes.map((box) => ({
      id: box.id,
      kode_box: box.kode_box,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      rack: box.rack.kode_rack,
      totalDocuments: box.documents.length,
      createdAt: box.createdAt,
    }));
  }

  async exportExcel(params: ExportExcelParams) {
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Reports');

    worksheet.columns = [
      {
        header: 'Title',
        key: 'title',
        width: 35,
      },
      {
        header: 'Description',
        key: 'description',
        width: 40,
      },
      {
        header: 'Status',
        key: 'status',
        width: 20,
      },
      {
        header: 'Box',
        key: 'box',
        width: 20,
      },
      {
        header: 'Rack',
        key: 'rack',
        width: 20,
      },
      {
        header: 'Created At',
        key: 'createdAt',
        width: 30,
      },
    ];

    let whereClause = {};

    if (params.type === 'monthly') {
      if (!params.year || !params.month) {
        throw new BadRequestException('year dan month wajib diisi');
      }

      whereClause = {
        createdAt: {
          gte: new Date(Date.UTC(params.year, params.month - 1, 1)),

          lte: new Date(Date.UTC(params.year, params.month, 0, 23, 59, 59)),
        },
      };
    } else if (params.type === 'range-month') {
      if (!params.year || !params.startMonth || !params.endMonth) {
        throw new BadRequestException('year, startMonth, endMonth wajib diisi');
      }

      whereClause = {
        createdAt: {
          gte: new Date(Date.UTC(params.year, params.startMonth - 1, 1)),

          lte: new Date(Date.UTC(params.year, params.endMonth, 0, 23, 59, 59)),
        },
      };
    } else if (params.type === 'yearly') {
      if (!params.year) {
        throw new BadRequestException('year wajib diisi');
      }

      whereClause = {
        createdAt: {
          gte: new Date(Date.UTC(params.year, 0, 1)),

          lte: new Date(Date.UTC(params.year, 11, 31, 23, 59, 59)),
        },
      };
    } else if (params.type === 'date-range') {
      if (!params.start || !params.end) {
        throw new BadRequestException('start dan end wajib diisi');
      }

      whereClause = {
        createdAt: {
          gte: new Date(params.start),

          lte: new Date(params.end),
        },
      };
    } else {
      throw new BadRequestException('type export tidak valid');
    }

    const documents = await this.prisma.document.findMany({
      where: whereClause,
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

    documents.forEach((doc) => {
      worksheet.addRow({
        title: doc.title,
        description: doc.description,
        status: doc.status,
        box: doc.box.kode_box,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        rack: doc.box.rack.kode_rack,
        createdAt: doc.createdAt.toLocaleString('id-ID'),
      });
    });

    worksheet.getRow(1).font = {
      bold: true,
    };

    return workbook.xlsx.writeBuffer();
  }
}
