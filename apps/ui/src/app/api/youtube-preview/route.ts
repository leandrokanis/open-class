import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? '';

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com') && parsed.pathname === '/watch') {
      return parsed.searchParams.get('v');
    }
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/embed/')) {
      return parsed.pathname.split('/embed/')[1] || null;
    }
    if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/shorts/')) {
      return parsed.pathname.split('/shorts/')[1]?.split('?')[0] || null;
    }
  } catch {
    return null;
  }
  return null;
}

function parseDuration(iso: string): number | null {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  return +(match[1] ?? 0) * 3600 + +(match[2] ?? 0) * 60 + +(match[3] ?? 0);
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  try {
    const videoId = extractVideoId(url);

    // oEmbed + Data API both run from Next.js server (local machine, has internet)
    const fetches: Promise<Response>[] = [
      fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`, { cache: 'no-store' }),
    ];
    if (videoId && YOUTUBE_API_KEY) {
      fetches.push(
        fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`,
          { cache: 'no-store' },
        ),
      );
    }

    const [oembedRes, dataRes] = await Promise.all(fetches);

    if (!oembedRes.ok) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 422 });
    }

    const oembed = await oembedRes.json();

    let durationSeconds: number | null = null;
    if (dataRes?.ok) {
      const data = await dataRes.json();
      const iso = data?.items?.[0]?.contentDetails?.duration;
      if (iso) durationSeconds = parseDuration(iso);
    }

    return NextResponse.json({
      title: oembed.title ?? null,
      thumbnailUrl: oembed.thumbnail_url ?? null,
      authorName: oembed.author_name ?? null,
      durationSeconds,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch video info' }, { status: 500 });
  }
}
