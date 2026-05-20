"use client";

import styled from "styled-components";
import { forwardRef, type TextareaHTMLAttributes } from "react";

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 8px 14px;
  background-color: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input, 8px);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-primary);
  caret-color: var(--color-text-primary);
  resize: vertical;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

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

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => <StyledTextarea ref={ref} {...props} />);
Textarea.displayName = "Textarea";
