"use client";

import styled from "styled-components";

const Select = styled.select`
  padding: 7px 32px 7px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-chip);
  font-size: 14px;
  color: var(--color-text-primary);
  background: #ffffff;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  min-width: 130px;
  outline: none;

  &:focus {
    border-color: var(--color-primary);
  }
`;

type Level = "beginner" | "intermediate" | "advanced";

interface LevelFilterProps {
  value: Level | null;
  onChange: (level: Level | null) => void;
}

const LEVELS: { value: Level; label: string }[] = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
];

export function LevelFilter({ value, onChange }: LevelFilterProps) {
  return (
    <Select
      value={value ?? ""}
      onChange={(e) => onChange((e.target.value as Level) || null)}
    >
      <option value="">Nível: Todos</option>
      {LEVELS.map((l) => (
        <option key={l.value} value={l.value}>
          {l.label}
        </option>
      ))}
    </Select>
  );
}
