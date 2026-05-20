"use client";

import styled from "styled-components";
import { Skeleton } from "@/components/ui/skeleton";

const Wrap = styled.div`
  min-height: 100vh;
  background: var(--color-background);
`;

const VideoSkeleton = styled(Skeleton)`
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 0;
`;

const InfoWrap = styled.div`
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DesktopLayout = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 380px;
    height: calc(100vh - 56px);
  }
`;

const MobileLayout = styled.div`
  @media (min-width: 1024px) {
    display: none;
  }
`;

export function PlayerSkeleton() {
  return (
    <Wrap>
      {/* Mobile */}
      <MobileLayout>
        <VideoSkeleton height="auto" />
        <InfoWrap>
          <Skeleton height="24px" width="70%" />
          <Skeleton height="14px" width="50%" />
          <Skeleton height="8px" />
          <Skeleton height="44px" />
        </InfoWrap>
        <InfoWrap>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height="44px" />
          ))}
        </InfoWrap>
      </MobileLayout>

      {/* Desktop */}
      <DesktopLayout>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <VideoSkeleton height="auto" />
          <InfoWrap>
            <Skeleton height="28px" width="60%" />
            <Skeleton height="14px" width="40%" />
          </InfoWrap>
        </div>
        <div style={{ borderLeft: "1px solid var(--color-border)", padding: "16px" }}>
          <InfoWrap>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height="44px" />
            ))}
          </InfoWrap>
        </div>
      </DesktopLayout>
    </Wrap>
  );
}
