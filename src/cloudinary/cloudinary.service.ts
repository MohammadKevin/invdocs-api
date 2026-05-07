import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import * as path from 'path';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const ext = path.extname(file.originalname).replace('.', '');

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'documents',
          resource_type: 'raw',
          use_filename: true,
          unique_filename: true,
          ...(ext && { format: ext }),
        },
        (error, result) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          if (error) return reject(error);

          const url = result!.secure_url.replace(
            '/raw/upload/',
            '/raw/upload/fl_attachment/',
          );

          resolve(url);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
