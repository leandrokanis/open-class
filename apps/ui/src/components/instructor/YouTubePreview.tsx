'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon } from '@/components/ui/Icon';

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
  color: var(--color-success);
  background: rgba(34,197,94,0.12);
  border: 1px solid rgba(34,197,94,0.3);
  border-radius: 4px;
  padding: 2px 8px;
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
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
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

const ThumbnailSkeleton = styled.div`
  width: 120px;
  height: 68px;
  border-radius: 4px;
  flex-shrink: 0;
  background: var(--color-surface-tertiary);
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
          <BadgeLoading>
            <Icon name="sync" size={13} />
            Carregando...
          </BadgeLoading>
          <Preview>
            <ThumbnailSkeleton />
            <Info>
              <ThumbnailSkeleton style={{ width: 160, height: 14, borderRadius: 3 }} />
              <ThumbnailSkeleton style={{ width: 100, height: 12, borderRadius: 3, marginTop: 4 }} />
            </Info>
          </Preview>
        </>
      ) : data ? (
        <>
          <BadgeValid><Icon name="check_circle" size={14} fill /> URL válida</BadgeValid>
          <Preview>
            <Thumbnail src={data.thumbnailUrl} alt={data.title} />
            <Info>
              <VideoTitle>{data.title}</VideoTitle>
              <Channel>{data.authorName}</Channel>
            </Info>
          </Preview>
        </>
      ) : invalid ? (
        <BadgeInvalid><Icon name="cancel" size={14} fill /> URL inválida</BadgeInvalid>
      ) : null}
    </Wrapper>
  );
}
