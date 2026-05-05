import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';

import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/Decorators/roles.decorator';

import { Role } from '@prisma/client';

import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';

import express from 'express';
import { join } from 'path';

interface JwtUser {
  id: string;
  email: string;
  role: Role;
}

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @Roles(Role.user)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Upload document (user only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
        boxId: { type: 'string' },
      },
    },
  })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDocumentDto,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.documentsService.create(file, dto, user);
  }

  @Get()
  @Roles(Role.super_admin, Role.admin_rack, Role.user)
  @ApiOperation({ summary: 'Get all documents' })
  findAll() {
    return this.documentsService.findAll();
  }

  @Get('my')
  @Roles(Role.user)
  @ApiOperation({ summary: 'Get my documents' })
  getMy(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.documentsService.findMyDocuments(user);
  }

  // 🔥 DETAIL
  @Get(':id')
  @Roles(Role.super_admin, Role.admin_rack, Role.user)
  @ApiOperation({ summary: 'Get document detail' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  // 🔥 UPDATE (USER)
  @Patch(':id')
  @Roles(Role.user)
  @ApiOperation({ summary: 'Update document (user only)' })
  @ApiParam({ name: 'id' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.documentsService.update(id, dto, user);
  }

  // 🔥 DELETE (USER)
  @Delete(':id')
  @Roles(Role.user)
  @ApiOperation({ summary: 'Delete document (user only)' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.documentsService.remove(id, user);
  }

  // 🔥 APPROVE (ADMIN)
  @Patch(':id/approve')
  @Roles(Role.admin_rack)
  @ApiOperation({ summary: 'Approve document (admin)' })
  approve(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.documentsService.approve(id, user);
  }

  // 🔥 REJECT (ADMIN)
  @Patch(':id/reject')
  @Roles(Role.admin_rack)
  @ApiOperation({ summary: 'Reject document (admin)' })
  reject(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.documentsService.reject(id, user);
  }

  // 🔥 DOWNLOAD (SEMUA ROLE)
  @Get(':id/download')
  @Roles(Role.super_admin, Role.admin_rack, Role.user)
  @ApiOperation({ summary: 'Download document' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  async download(@Param('id') id: string, @Res() res: express.Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const doc = await this.documentsService.findOne(id);

    const filePath = join(
      process.cwd(),
      'uploads/documents',
      doc.fileUrl.split('/').pop() as string,
    );

    return res.download(filePath);
  }
}
