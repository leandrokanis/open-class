import { describe, it, expect } from 'vitest';
import { setUploadsCrossOriginHeaders } from './static-assets-config';

describe('setUploadsCrossOriginHeaders', () => {
  it('should mark uploaded assets as cross-origin embeddable', () => {
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (name: string, value: string) => {
        headers[name] = value;
      },
    };

    setUploadsCrossOriginHeaders(res);

    // Without this, helmet's default `same-origin` blocks the UI (a different
    // origin) from embedding course thumbnails via <img>. See issue #76.
    expect(headers['Cross-Origin-Resource-Policy']).toBe('cross-origin');
  });
});
