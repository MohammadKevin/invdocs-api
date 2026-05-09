import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { Readable } from 'stream';
import * as path from 'path';

// Ekstensi yang dianggap sebagai 'image' atau 'video' oleh Cloudinary
const IMAGE_EXTS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'bmp',
  'svg',
  'tiff',
  'ico',
];
const VIDEO_EXTS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'];

function getResourceType(ext: string): 'image' | 'video' | 'raw' {
  if (IMAGE_EXTS.includes(ext.toLowerCase())) return 'image';
  if (VIDEO_EXTS.includes(ext.toLowerCase())) return 'video';
  return 'raw'; // pdf, docx, xlsx, pptx, txt, dll → raw
}

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const ext = path
        .extname(file.originalname)
        .replace('.', '')
        .toLowerCase();
      const resourceType = getResourceType(ext);

      const options: UploadApiOptions = {
        folder: 'documents',
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        ...(ext && { format: ext }),
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          if (error) return reject(error);
          console.log('CLOUDINARY RESULT:', result);
          resolve(result!.secure_url);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
