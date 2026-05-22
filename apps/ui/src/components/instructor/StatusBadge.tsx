import React from "react";
import styled from "styled-components";

const Badge = styled.span<{ $published: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $published }) => ($published ? "rgba(34,197,94,0.12)" : "var(--color-surface-secondary)")};
  color: ${({ $published }) => ($published ? "var(--color-success)" : "var(--color-text-secondary)")};
`;

interface StatusBadgeProps {
  status: "published" | "draft";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge $published={status === "published"}>
      {status === "published" ? "Publicado" : "Rascunho"}
    </Badge>
  );
}
