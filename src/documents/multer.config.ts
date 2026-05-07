import { diskStorage } from 'multer';

import { extname, join } from 'path';

import { BadRequestException } from '@nestjs/common';

import * as fs from 'fs';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const uploadPath = join(process.cwd(), 'uploads', 'documents');

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, {
          recursive: true,
        });
      }

      callback(null, uploadPath);
    },

    filename: (req, file, callback) => {
      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${extname(file.originalname)}`;

      callback(null, uniqueName);
    },
  }),

  fileFilter: (req, file, callback) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    if (!allowedTypes.includes(file.mimetype)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return callback(new BadRequestException('File tidak didukung'), false);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    callback(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};
