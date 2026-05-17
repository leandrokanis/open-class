"use client";

import styled from "styled-components";
import { type HTMLAttributes } from "react";

const StyledCard = styled.div`
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const StyledCardHeader = styled.div`
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledCardContent = styled.div`
  padding: 14px 16px;
  flex: 1;
`;

const StyledCardFooter = styled.div`
  padding: 0 16px 16px;
  display: flex;
  align-items: center;
`;

export function Card({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <StyledCard {...props}>{children}</StyledCard>;
}

export function CardHeader({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <StyledCardHeader {...props}>{children}</StyledCardHeader>;
}

export function CardContent({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <StyledCardContent {...props}>{children}</StyledCardContent>;
}

export function CardFooter({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <StyledCardFooter {...props}>{children}</StyledCardFooter>;
}
