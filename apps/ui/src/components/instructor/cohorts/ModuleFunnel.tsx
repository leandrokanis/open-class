'use client';

import styled from 'styled-components';
import type { CohortProgress } from '@/lib/instructor';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Title = styled.h3`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
`;

const Line = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  align-items: center;
  gap: 12px;
`;

const ModName = styled.span`
  font-size: 13px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Track = styled.div`
  height: 8px;
  border-radius: 4px;
  background: var(--color-surface-tertiary);
  overflow: hidden;
`;

const Fill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: var(--color-primary);
  transition: width 0.3s ease;
`;

const Count = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

interface ModuleFunnelProps {
  modules: CohortProgress['modules'];
  enrolledCount: number;
}

export function ModuleFunnel({ modules, enrolledCount }: ModuleFunnelProps) {
  if (modules.length === 0) return null;
  const ordered = [...modules].sort((a, b) => a.position - b.position);

  return (
    <Wrapper>
      <Title>Conclusão por módulo</Title>
      {ordered.map((m) => {
        const pct = enrolledCount > 0 ? Math.round((m.completedCount / enrolledCount) * 100) : 0;
        return (
          <Line key={m.moduleId}>
            <ModName title={m.title}>{m.title}</ModName>
            <Track><Fill $pct={pct} /></Track>
            <Count>{m.completedCount} de {enrolledCount} · {pct}%</Count>
          </Line>
        );
      })}
    </Wrapper>
  );
}
