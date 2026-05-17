"use client";

import styled from "styled-components";
import { forwardRef, type InputHTMLAttributes } from "react";

const StyledInput = styled.input`
  width: 100%;
  padding: 8px 14px;
  background-color: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
  color: var(--color-text-primary);
  outline: none;
  transition: border-color 0.15s;

  &::placeholder {
    color: var(--color-text-tertiary);
  }

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <StyledInput ref={ref} {...props} />);
Input.displayName = "Input";
