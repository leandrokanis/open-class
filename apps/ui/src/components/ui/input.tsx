"use client";

import styled, { css } from "styled-components";
import { forwardRef, type InputHTMLAttributes } from "react";

type InputSize = "sm" | "md";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
}

const sizeStyles: Record<InputSize, ReturnType<typeof css>> = {
  sm: css`
    padding: 8px 14px;
    font-size: 13px;
    line-height: 16px;
  `,
  md: css`
    padding: 13px 15px;
    font-size: 15px;
    line-height: 18px;
  `,
};

const StyledInput = styled.input<{ $size: InputSize }>`
  width: 100%;
  background-color: var(--color-surface-secondary, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--radius-input, 8px);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-weight: 400;
  color: var(--color-text-primary, #0f172a);
  caret-color: var(--color-text-primary, #0f172a);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  ${({ $size }) => sizeStyles[$size]}

  &::placeholder {
    color: var(--color-text-tertiary, #94a3b8);
  }

  &:focus {
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 0 0 2px var(--color-primary-light, rgba(59, 130, 246, 0.1));
  }

  &[aria-invalid="true"] {
    border-color: var(--color-destructive, #ef4444);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ inputSize = "sm", ...props }, ref) => (
    <StyledInput ref={ref} $size={inputSize} {...props} />
  )
);
Input.displayName = "Input";
