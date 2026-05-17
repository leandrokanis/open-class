"use client";

import styled, { css } from "styled-components";
import { type HTMLAttributes } from "react";

type BadgeVariant = "default" | "light" | "overlay";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, ReturnType<typeof css>> = {
  default: css`
    background-color: var(--color-primary);
    color: var(--color-text-on-primary);
  `,
  light: css`
    background-color: var(--color-primary-light);
    color: var(--color-primary);
  `,
  overlay: css`
    background-color: var(--color-overlay-subtle);
    color: var(--color-text-on-primary);
  `,
};

const StyledBadge = styled.span<{ $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-badge);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 10px;
  font-weight: 600;
  line-height: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;

  ${({ $variant }) => variantStyles[$variant]}
`;

export function Badge({
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <StyledBadge $variant={variant} {...props}>
      {children}
    </StyledBadge>
  );
}
