import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnprocessableEntityException, ServiceUnavailableException } from '@nestjs/common';
import { YouTubeService } from './youtube.service';

describe('YouTubeService', () => {
  let service: YouTubeService;

  beforeEach(() => {
    service = new YouTubeService();
  });

  describe('extractVideoId', () => {
    it('extrai ID de youtube.com/watch?v=', () => {
      expect(service.extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extrai ID de youtu.be/', () => {
      expect(service.extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extrai ID de youtube.com/embed/', () => {
      expect(service.extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extrai ID de youtube.com/shorts/', () => {
      expect(service.extractVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('extrai ID de youtube.com/shorts/ com query params', () => {
      expect(service.extractVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ?si=abc')).toBe('dQw4w9WgXcQ');
    });

    it('retorna null para URL não YouTube', () => {
      expect(service.extractVideoId('https://vimeo.com/123456')).toBeNull();
    });

    it('retorna null para string inválida', () => {
      expect(service.extractVideoId('not-a-url')).toBeNull();
    });
  });

  describe('parseDuration', () => {
    it('converte PT1H2M3S corretamente', () => {
      expect(service.parseDuration('PT1H2M3S')).toBe(3723);
    });

    it('converte PT30S corretamente', () => {
      expect(service.parseDuration('PT30S')).toBe(30);
    });

    it('converte PT4M13S corretamente', () => {
      expect(service.parseDuration('PT4M13S')).toBe(253);
    });

    it('converte PT0S corretamente', () => {
      expect(service.parseDuration('PT0S')).toBe(0);
    });

    it('retorna null para formato inválido', () => {
      expect(service.parseDuration('invalid')).toBeNull();
    });
  });

  describe('validateAndFetchInfo', () => {
    it('lança UnprocessableEntityException para URL inválida', async () => {
      await expect(service.validateAndFetchInfo('https://vimeo.com/123')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('retorna videoId e durationSeconds para vídeo válido', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              contentDetails: { duration: 'PT3M33S' },
              status: { embeddable: true },
            },
          ],
        }),
      }));

      const result = await service.validateAndFetchInfo('https://youtu.be/dQw4w9WgXcQ');
      expect(result.videoId).toBe('dQw4w9WgXcQ');
      expect(result.durationSeconds).toBe(213);

      vi.unstubAllGlobals();
    });

    it('lança UnprocessableEntityException se vídeo não encontrado', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      }));

      await expect(
        service.validateAndFetchInfo('https://youtu.be/dQw4w9WgXcQ'),
      ).rejects.toThrow(UnprocessableEntityException);

      vi.unstubAllGlobals();
    });

    it('lança UnprocessableEntityException se vídeo não é embeddable', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [{ contentDetails: { duration: 'PT5M' }, status: { embeddable: false } }],
        }),
      }));

      await expect(
        service.validateAndFetchInfo('https://youtu.be/dQw4w9WgXcQ'),
      ).rejects.toThrow(UnprocessableEntityException);

      vi.unstubAllGlobals();
    });

    it('lança ServiceUnavailableException quando fetch falha', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      await expect(
        service.validateAndFetchInfo('https://youtu.be/dQw4w9WgXcQ'),
      ).rejects.toThrow(ServiceUnavailableException);

      vi.unstubAllGlobals();
    });
  });
});
