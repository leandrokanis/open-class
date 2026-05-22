import { Injectable, UnprocessableEntityException, ServiceUnavailableException } from '@nestjs/common';

export interface YouTubeVideoInfo {
  videoId: string;
  durationSeconds: number | null;
}

@Injectable()
export class YouTubeService {
  private readonly apiKey = process.env.YOUTUBE_API_KEY ?? '';

  extractVideoId(url: string): string | null {
    try {
      const parsed = new URL(url);
      // https://www.youtube.com/watch?v=ID
      if (parsed.hostname.includes('youtube.com') && parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }
      // https://youtu.be/ID
      if (parsed.hostname === 'youtu.be') {
        return parsed.pathname.slice(1) || null;
      }
      // https://www.youtube.com/embed/ID
      if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1] || null;
      }
      // https://www.youtube.com/shorts/ID
      if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/shorts/')[1]?.split('?')[0] || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  parseDuration(iso: string): number | null {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return null;
    const hours   = +(match[1] ?? 0);
    const minutes = +(match[2] ?? 0);
    const seconds = +(match[3] ?? 0);
    return hours * 3600 + minutes * 60 + seconds;
  }

  async validateAndFetchInfo(url: string): Promise<YouTubeVideoInfo> {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new UnprocessableEntityException('URL do YouTube inválida ou em formato não reconhecido.');
    }

    if (!this.apiKey) {
      return { videoId, durationSeconds: null };
    }

    const apiUrl =
      `https://www.googleapis.com/youtube/v3/videos` +
      `?part=contentDetails,status&id=${videoId}&key=${this.apiKey}`;

    let data: { items?: { contentDetails?: { duration?: string }; status?: { embeddable?: boolean } }[] };

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        return { videoId, durationSeconds: null };
      }
      data = await res.json() as typeof data;
    } catch {
      return { videoId, durationSeconds: null };
    }

    if (!data.items || data.items.length === 0) {
      throw new UnprocessableEntityException('Vídeo do YouTube não encontrado ou não está disponível.');
    }

    const item = data.items[0];
    if (item.status?.embeddable === false) {
      throw new UnprocessableEntityException('O vídeo do YouTube não permite incorporação (embed).');
    }

    const durationSeconds = item.contentDetails?.duration
      ? this.parseDuration(item.contentDetails.duration)
      : null;

    return { videoId, durationSeconds };
  }
}
