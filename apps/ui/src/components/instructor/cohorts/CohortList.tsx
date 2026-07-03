'use client';

import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Icon } from '@/components/ui/Icon';
import type { CohortData } from '@/lib/instructor';

const List = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
`;

const Row = styled.button`
  display: grid;
  grid-template-columns: 1fr auto auto 20px;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: var(--color-surface);
  border: none;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background 0.12s;

  &:last-child { border-bottom: none; }
  &:hover { background: var(--color-surface-secondary); }

  @media (max-width: 640px) {
    grid-template-columns: 1fr auto 20px;
  }
`;

const NameCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Name = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Period = styled.span`
  font-size: 12.5px;
  color: var(--color-text-secondary);
`;

const StatusBadge = styled.span<{ $status: CohortData['status'] }>`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 12px;
  white-space: nowrap;
  color: ${({ $status }) =>
    $status === 'aberta' ? 'var(--color-success)'
    : $status === 'agendada' ? 'var(--color-primary)'
    : 'var(--color-text-secondary)'};
  background: ${({ $status }) =>
    $status === 'aberta' ? 'rgba(34,197,94,0.12)'
    : $status === 'agendada' ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
    : 'var(--color-surface-secondary)'};
  border: 1px solid var(--color-border);
`;

const Occupancy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 120px;

  @media (max-width: 640px) { display: none; }
`;

const OccText = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
`;

const Bar = styled.div`
  height: 4px;
  border-radius: 2px;
  background: var(--color-surface-tertiary);
  overflow: hidden;
`;

const Fill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: var(--color-primary);
`;

const STATUS_LABEL: Record<CohortData['status'], string> = {
  agendada: 'Agendada',
  aberta: 'Inscrições abertas',
  encerrada: 'Encerrada',
};

const STATUS_ORDER: Record<CohortData['status'], number> = { aberta: 0, agendada: 1, encerrada: 2 };

function formatPeriod(start: string, end: string): string {
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return `Inscrições: ${fmt(start)} — ${fmt(end)}`;
}

interface CohortListProps {
  courseId: string;
  cohorts: CohortData[];
  /** inscritos por turma (id → nº), quando disponível */
  enrolledByCohort?: Record<string, number>;
}

export function CohortList({ courseId, cohorts, enrolledByCohort = {} }: CohortListProps) {
  const router = useRouter();
  const ordered = [...cohorts].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      || new Date(a.enrollmentStart).getTime() - new Date(b.enrollmentStart).getTime(),
  );

  return (
    <List>
      {ordered.map((cohort) => {
        const enrolled = enrolledByCohort[cohort.id];
        const pct = enrolled != null && cohort.seats > 0
          ? Math.min(100, Math.round((enrolled / cohort.seats) * 100)) : 0;
        return (
          <Row
            key={cohort.id}
            onClick={() => router.push(`/instructor/courses/${courseId}/cohorts/${cohort.id}`)}
          >
            <NameCol>
              <Name>{cohort.name}</Name>
              <Period>{formatPeriod(cohort.enrollmentStart, cohort.enrollmentEnd)}</Period>
            </NameCol>
            <StatusBadge $status={cohort.status}>{STATUS_LABEL[cohort.status]}</StatusBadge>
            <Occupancy>
              <OccText>
                {enrolled != null ? `${enrolled}/${cohort.seats}` : `${cohort.seats}`} vagas
              </OccText>
              {enrolled != null && <Bar><Fill $pct={pct} /></Bar>}
            </Occupancy>
            <Icon name="chevron_right" size={18} style={{ color: 'var(--color-text-tertiary)' }} />
          </Row>
        );
      })}
    </List>
  );
}
