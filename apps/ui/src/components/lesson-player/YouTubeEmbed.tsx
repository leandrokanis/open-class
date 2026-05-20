"use client";

import { useEffect, useRef, useId } from "react";
import styled from "styled-components";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
    _ytApiLoaded: boolean;
    _ytApiCallbacks: Array<() => void>;
  }
}

function loadYTApi(onReady: () => void) {
  if (typeof window === "undefined") return;

  if (window.YT?.Player) {
    onReady();
    return;
  }

  if (!window._ytApiCallbacks) window._ytApiCallbacks = [];
  window._ytApiCallbacks.push(onReady);

  if (!window._ytApiLoaded) {
    window._ytApiLoaded = true;
    window.onYouTubeIframeAPIReady = () => {
      window._ytApiCallbacks?.forEach((cb) => cb());
      window._ytApiCallbacks = [];
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  }
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;

  @media (orientation: landscape) and (max-width: 1023px) {
    aspect-ratio: unset;
    height: 100dvh;
  }
`;

const PlayerTarget = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const Fallback = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 14px;
`;

interface YouTubeEmbedProps {
  videoId: string | null;
  onEnded?: () => void;
}

export function YouTubeEmbed({ videoId, onEnded }: YouTubeEmbedProps) {
  const containerId = useId().replace(/:/g, "");
  const playerRef = useRef<YT.Player | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    if (!videoId) return;

    function createPlayer() {
      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, autoplay: 1 },
        events: {
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onEndedRef.current?.();
            }
          },
        },
      });
    }

    loadYTApi(createPlayer);

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId, containerId]);

  if (!videoId) {
    return (
      <Wrapper>
        <Fallback>Vídeo não disponível</Fallback>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <PlayerTarget id={containerId} title="Vídeo da aula" />
    </Wrapper>
  );
}
