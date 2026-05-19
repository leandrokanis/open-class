"use client";

import styled from "styled-components";
import { type LabelHTMLAttributes } from "react";

const StyledLabel = styled.label`
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;
  color: var(--color-text-primary);
  cursor: default;

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function Label({
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return <StyledLabel {...props}>{children}</StyledLabel>;
}
