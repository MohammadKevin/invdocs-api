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
  HttpStatus,
} from '@nestjs/common';

import type { Response } from 'express';

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
import { Public } from 'src/auth/Decorators/public.decorator';

import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { CloudinaryService } from '../cloudinary/cloudinary.service';

interface JwtUser {
  id: string;
  role: Role;
}

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @Roles(Role.user)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiOperation({ summary: 'Upload document' })
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
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDocumentDto,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;

    const fileUrl = await this.cloudinaryService.uploadFile(file);

    return this.documentsService.create(fileUrl, file, dto, user);
  }

  @Get()
  @Roles(Role.super_admin, Role.admin_rack, Role.user)
  @UseGuards(RolesGuard)
  findAll() {
    return this.documentsService.findAll();
  }

  @Get('my')
  @Roles(Role.user)
  @UseGuards(RolesGuard)
  getMy(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.documentsService.findMyDocuments(user);
  }

  @Get(':id')
  @Roles(Role.super_admin, Role.admin_rack, Role.user)
  @UseGuards(RolesGuard)
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.user)
  @UseGuards(RolesGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.documentsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.user)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.documentsService.remove(id, user);
  }

  @Patch(':id/approve')
  @Roles(Role.admin_rack, Role.super_admin)
  @UseGuards(RolesGuard)
  @ApiParam({ name: 'id' })
  approve(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.documentsService.approve(id, user);
  }

  @Patch(':id/reject')
  @Roles(Role.admin_rack, Role.super_admin)
  @UseGuards(RolesGuard)
  @ApiParam({ name: 'id' })
  reject(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: JwtUser = req.user;
    return this.documentsService.reject(id, user);
  }

  @Get(':id/download')
  @Public()
  async download(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.documentsService.findOne(id);

    if (!doc?.fileUrl) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'File not found',
      });
    }

    return res.redirect(HttpStatus.FOUND, doc.fileUrl);
  }
}
