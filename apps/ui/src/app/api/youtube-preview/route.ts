import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 422 });
    }
    const data = await res.json();
    return NextResponse.json({
      title: data.title ?? null,
      thumbnailUrl: data.thumbnail_url ?? null,
      authorName: data.author_name ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch oEmbed' }, { status: 500 });
  }
}
