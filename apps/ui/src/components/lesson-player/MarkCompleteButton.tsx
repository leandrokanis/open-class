"use client";

import styled, { css } from "styled-components";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/Icon";

const GreenButton = styled(Button)<{ $completed: boolean; $fullWidth: boolean }>`
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}

  ${({ $completed }) =>
    $completed
      ? css`
          background-color: var(--color-success);
          color: #fff;
          border-color: var(--color-success);
          &:hover:not(:disabled) {
            opacity: 0.88;
            background-color: var(--color-success);
          }
        `
      : css`
          background-color: transparent;
          color: var(--color-success);
          border-color: var(--color-success);
          &:hover:not(:disabled) {
            background-color: color-mix(in srgb, var(--color-success) 10%, transparent);
          }
        `}
`;

interface MarkCompleteButtonProps {
  isCompleted: boolean;
  isLoading: boolean;
  onToggle: () => void;
  inline?: boolean;
}

export function MarkCompleteButton({ isCompleted, isLoading, onToggle, inline = false }: MarkCompleteButtonProps) {
  return (
    <GreenButton
      variant="outline"
      size="sm"
      $completed={isCompleted}
      $fullWidth={!inline}
      disabled={isLoading}
      onClick={onToggle}
    >
      <Icon
        name="check_circle"
        size={15}
        fill={isCompleted}
        style={{ color: isCompleted ? "#fff" : "var(--color-success)" }}
      />
      {isCompleted ? "Concluído" : "Concluir"}
    </GreenButton>
  );
}
