'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BadgeValid = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #15803d;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 4px;
  padding: 2px 8px;
`;

const BadgeInvalid = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #b91c1c;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 4px;
  padding: 2px 8px;
`;

const Preview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
`;

const Thumbnail = styled.img`
  width: 120px;
  height: 68px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
`;

const VideoTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Channel = styled.span`
  font-size: 12px;
  color: #64748b;
`;

interface OEmbedData {
  title: string;
  thumbnailUrl: string;
  authorName: string;
}

interface YouTubePreviewProps {
  url: string;
}

export default function YouTubePreview({ url }: YouTubePreviewProps) {
  const [data, setData] = useState<OEmbedData | null>(null);
  const [invalid, setInvalid] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!url.trim()) {
      setData(null);
      setInvalid(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/youtube-preview?url=${encodeURIComponent(url)}`);
        if (!res.ok) {
          setData(null);
          setInvalid(true);
          return;
        }
        const json = await res.json();
        setData(json);
        setInvalid(false);
      } catch {
        setData(null);
        setInvalid(true);
      }
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [url]);

  if (!url.trim()) return null;

  return (
    <Wrapper>
      {data ? (
        <>
          <BadgeValid>✓ URL válida</BadgeValid>
          <Preview>
            <Thumbnail src={data.thumbnailUrl} alt={data.title} />
            <Info>
              <VideoTitle>{data.title}</VideoTitle>
              <Channel>{data.authorName}</Channel>
            </Info>
          </Preview>
        </>
      ) : invalid ? (
        <BadgeInvalid>✕ URL inválida</BadgeInvalid>
      ) : null}
    </Wrapper>
  );
}
