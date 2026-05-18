"use client";

import styled from "styled-components";

const Button = styled.button`
  display: block;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  padding: 14px 24px;
  border: 1.5px solid var(--color-primary);
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--color-primary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--color-primary);
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  loading?: boolean;
  hasMore: boolean;
}

export function LoadMoreButton({ onLoadMore, loading, hasMore }: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <Button onClick={onLoadMore} disabled={loading}>
      {loading ? "Carregando..." : "Ver mais cursos"}
    </Button>
  );
}
