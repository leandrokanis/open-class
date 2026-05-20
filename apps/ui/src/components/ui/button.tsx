"use client";

import styled, { css } from "styled-components";
import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "default" | "outline" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const variantStyles: Record<Variant, ReturnType<typeof css>> = {
  default: css`
    background-color: var(--color-primary);
    color: var(--color-text-on-primary);
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  `,
  outline: css`
    background-color: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);
    &:hover:not(:disabled) {
      background-color: var(--color-surface-tertiary);
      color: var(--color-text-primary);
    }
  `,
  secondary: css`
    background-color: var(--color-surface-tertiary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    &:hover:not(:disabled) {
      background-color: var(--color-border);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: var(--color-text-primary);
    &:hover:not(:disabled) {
      background-color: var(--color-surface-tertiary);
    }
  `,
  destructive: css`
    background-color: var(--color-destructive);
    color: var(--color-destructive-foreground);
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  `,
};

const sizeStyles: Record<Size, ReturnType<typeof css>> = {
  sm: css`
    padding: 6px 12px;
    font-size: 13px;
    line-height: 16px;
  `,
  md: css`
    padding: 14px 20px;
    font-size: 15px;
    line-height: 18px;
  `,
  lg: css`
    padding: 16px 28px;
    font-size: 16px;
    line-height: 20px;
  `,
};

const StyledButton = styled.button<{ $variant: Variant; $size: Size }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-btn);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  border: 1px solid transparent;
  transition: opacity 0.15s, background-color 0.15s, color 0.15s;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "default",
      size = "md",
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot ref={ref} {...props}>
          {children}
        </Slot>
      );
    }
    return (
      <StyledButton ref={ref} $variant={variant} $size={size} {...props}>
        {children}
      </StyledButton>
    );
  }
);
Button.displayName = "Button";
