import React from "react";
import styled from "styled-components";

const Badge = styled.span<{ $published: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $published }) => ($published ? "#e6f7ee" : "#fff8e6")};
  color: ${({ $published }) => ($published ? "#1a7340" : "#b45309")};
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
