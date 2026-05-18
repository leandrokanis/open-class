"use client";

import * as RadixAvatar from "@radix-ui/react-avatar";
import styled from "styled-components";

const Root = styled(RadixAvatar.Root)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-avatar);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--gradient-avatar);
`;

const Image = styled(RadixAvatar.Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Fallback = styled(RadixAvatar.Fallback)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--gradient-avatar);
  color: var(--color-text-on-primary);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 14px;
  font-weight: 700;
`;

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, alt, fallback, size = 40, className }: AvatarProps) {
  return (
    <Root style={{ width: size, height: size }} className={className}>
      {src && <Image src={src} alt={alt ?? ""} />}
      <Fallback delayMs={0}>{fallback}</Fallback>
    </Root>
  );
}
