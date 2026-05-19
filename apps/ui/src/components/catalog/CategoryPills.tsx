"use client";

import styled from "styled-components";
import type { CategoryItem } from "@/lib/catalog";

const PillsWrapper = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0 2px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Pill = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  padding: 7px 18px;
  border-radius: var(--radius-chip);
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  border: 1.5px solid ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-border)")};
  background: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-surface)")};
  color: ${({ $active }) => ($active ? "var(--color-text-on-primary)" : "var(--color-text-primary)")};
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    border-color: var(--color-primary);
    color: ${({ $active }) => ($active ? "var(--color-text-on-primary)" : "var(--color-primary)")};
  }
`;

interface CategoryPillsProps {
  categories: CategoryItem[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryPills({ categories, activeId, onSelect }: CategoryPillsProps) {
  return (
    <PillsWrapper>
      <Pill $active={activeId === null} onClick={() => onSelect(null)}>
        Todos
      </Pill>
      {categories.map((cat) => (
        <Pill
          key={cat.id}
          $active={activeId === cat.id}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </Pill>
      ))}
    </PillsWrapper>
  );
}
