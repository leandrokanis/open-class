import { describe, it, expect, vi, afterEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';

vi.mock('fs/promises', () => ({ unlink: vi.fn() }));

type FileFilter = (
  req: unknown,
  file: { mimetype: string },
  cb: (err: Error | null, accept: boolean) => void,
) => void;

describe('UploadService', () => {
  const service = new UploadService();

  it('publicUrl() builds a URL under uploads/<subdir>', () => {
    const url = service.publicUrl('logos', 'abc.png');
    expect(url).toContain('/uploads/logos/abc.png');
  });

  it('imageMulterOptions() accepts a valid image mimetype', () => {
    const filter = service.imageMulterOptions('logos').fileFilter as unknown as FileFilter;
    const cb = vi.fn();

    filter({}, { mimetype: 'image/png' }, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('imageMulterOptions() rejects a non-image mimetype with 400', () => {
    const filter = service.imageMulterOptions('logos').fileFilter as unknown as FileFilter;
    const cb = vi.fn();

    filter({}, { mimetype: 'application/pdf' }, cb);

    expect(cb).toHaveBeenCalledTimes(1);
    const [err, accept] = cb.mock.calls[0];
    expect(err).toBeInstanceOf(BadRequestException);
    expect(accept).toBe(false);
  });

  it('imageMulterOptions() sets a max file size limit', () => {
    const opts = service.imageMulterOptions('logos');
    expect(opts.limits?.fileSize).toBe(2 * 1024 * 1024);
  });

  describe('deleteByUrl()', () => {
    afterEach(() => vi.clearAllMocks());

    it('should delete an existing file derived from the URL', async () => {
      const { unlink } = await import('fs/promises');
      vi.mocked(unlink).mockResolvedValue(undefined);

      process.env.APP_URL = 'http://localhost:3001';
      const url = 'http://localhost:3001/uploads/avatars/abc.jpg';

      await service.deleteByUrl(url);

      expect(unlink).toHaveBeenCalledOnce();
      const calledPath: string = vi.mocked(unlink).mock.calls[0][0] as string;
      expect(calledPath).toContain('avatars');
      expect(calledPath).toContain('abc.jpg');
    });

    it('should not throw when file does not exist (idempotent)', async () => {
      const { unlink } = await import('fs/promises');
      const err = Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      vi.mocked(unlink).mockRejectedValue(err);

      process.env.APP_URL = 'http://localhost:3001';
      const url = 'http://localhost:3001/uploads/avatars/missing.jpg';

      await expect(service.deleteByUrl(url)).resolves.not.toThrow();
    });
  });
});
