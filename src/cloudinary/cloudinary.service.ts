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

          resource_type: 'auto',

          use_filename: true,

          unique_filename: true,

          ...(ext && { format: ext }),
        },

        (error, result) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          if (error) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            return reject(error);
          }

          console.log('CLOUDINARY RESULT:', result);

          // ✅ LANGSUNG PAKAI SECURE_URL
          resolve(result!.secure_url);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
