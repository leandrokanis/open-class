"use client";

import styled from "styled-components";

const Wrapper = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-destructive);
  font-size: 13px;
  line-height: 18px;
  font-family: var(--font-inter), system-ui, sans-serif;
`;

interface FormErrorProps {
  message?: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <Wrapper role="alert" aria-live="polite">
      <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
        error
      </span>
      {message}
    </Wrapper>
  );
}
