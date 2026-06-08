import { describe, it, expect, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';

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
});
