'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon } from '@/components/ui/Icon';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;


const BadgeInvalid = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-destructive);
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 4px;
  padding: 2px 8px;
`;

const BadgeLoading = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const Preview = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-surface-secondary);
`;

const ThumbnailWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ThumbnailSkeleton = styled.div`
  width: 100%;
  height: 100%;
  background: var(--color-surface-tertiary);
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
`;

const VideoTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Channel = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

interface OEmbedData {
  title: string;
  thumbnailUrl: string;
  authorName: string;
  durationSeconds: number | null;
}

export interface VideoInfo {
  durationSeconds: number | null;
}

interface YouTubePreviewProps {
  url: string;
  onVideoInfo?: (info: VideoInfo) => void;
}

export default function YouTubePreview({ url, onVideoInfo }: YouTubePreviewProps) {
  const [data, setData] = useState<OEmbedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!url.trim()) {
      setData(null);
      setInvalid(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setInvalid(false);

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/youtube-preview?url=${encodeURIComponent(url)}`);
        if (!res.ok) {
          setData(null);
          setInvalid(true);
          setLoading(false);
          return;
        }
        const json: OEmbedData = await res.json();
        setData(json);
        setInvalid(false);
        setLoading(false);
        onVideoInfo?.({ durationSeconds: json.durationSeconds });
      } catch {
        setData(null);
        setInvalid(true);
        setLoading(false);
      }
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (!url.trim()) return null;

  return (
    <Wrapper>
      {loading ? (
        <>
          <Preview>
            <ThumbnailWrapper><ThumbnailSkeleton /></ThumbnailWrapper>
            <Info>
              <ThumbnailSkeleton style={{ width: '60%', height: 13, borderRadius: 3 }} />
              <ThumbnailSkeleton style={{ width: '35%', height: 11, borderRadius: 3, marginTop: 2 }} />
            </Info>
          </Preview>
          <BadgeLoading><Icon name="sync" size={13} />Carregando...</BadgeLoading>
        </>
      ) : data ? (
        <Preview>
          <ThumbnailWrapper>
            <Thumbnail src={data.thumbnailUrl} alt={data.title} />
          </ThumbnailWrapper>
          <Info>
            <VideoTitle>{data.title}</VideoTitle>
            <Channel>{data.authorName}</Channel>
          </Info>
        </Preview>
      ) : invalid ? (
        <BadgeInvalid><Icon name="cancel" size={14} fill /> URL inválida</BadgeInvalid>
      ) : null}
    </Wrapper>
  );
}
