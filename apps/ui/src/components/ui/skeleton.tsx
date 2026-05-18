"use client";

import styled, { keyframes } from "styled-components";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
`;

const StyledSkeleton = styled.div<{ $height?: string; $width?: string }>`
  background-color: var(--color-border);
  border-radius: var(--radius-card);
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  height: ${({ $height }) => $height ?? "20px"};
  width: ${({ $width }) => $width ?? "100%"};
`;

export interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
  style?: React.CSSProperties;
}

import React from "react";

export function Skeleton({ height, width, className, style }: SkeletonProps) {
  return <StyledSkeleton $height={height} $width={width} className={className} style={style} />;
}
