import { Injectable, BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';

const UPLOAD_ROOT = join(process.cwd(), 'uploads');
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const MAX_SIZE = 2 * 1024 * 1024;

type FileFilterCb = (error: Error | null, acceptFile: boolean) => void;

@Injectable()
export class UploadService {
  /** Multer options for an image upload into `uploads/<subdir>`. */
  imageMulterOptions(subdir: string): MulterOptions {
    const dir = join(UPLOAD_ROOT, subdir);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    return {
      storage: diskStorage({
        destination: dir,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filename: (_req: any, file: Express.Multer.File, cb: (err: Error | null, name: string) => void) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}-${Date.now()}${ext}`);
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fileFilter: (_req: any, file: Express.Multer.File, cb: FileFilterCb) => {
        if (!ALLOWED_MIMES.has(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Arquivo inválido. Formatos aceitos: jpg, png, webp. Tamanho máximo: 2MB.',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: MAX_SIZE },
    };
  }

  /** Public URL for a file stored under `uploads/<subdir>`. */
  publicUrl(subdir: string, filename: string): string {
    const appUrl = process.env.APP_URL ?? 'http://localhost:3001';
    return `${appUrl}/uploads/${subdir}/${filename}`;
  }

  // ── Backwards-compatible helpers for course thumbnails ──────────────────────
  multerOptions(): MulterOptions {
    return this.imageMulterOptions('thumbnails');
  }

  thumbnailUrl(filename: string): string {
    return this.publicUrl('thumbnails', filename);
  }
}
