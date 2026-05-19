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
  background-color: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-weight: 400;
  color: var(--color-text-primary);
  caret-color: var(--color-text-primary);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  ${({ $size }) => sizeStyles[$size]}

  &::placeholder {
    color: var(--color-text-tertiary);
  }

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }

  &[aria-invalid="true"] {
    border-color: var(--color-destructive);
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
