'use client';

import styled from 'styled-components';
import { Icon } from '@/components/ui/Icon';
import { StudentRow, type StudentProgress } from './StudentRow';

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.04);
  border-radius: 12px;
  padding: 14px 16px;
`;

const Title = styled.h3`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-destructive);
  margin-bottom: 6px;
`;

const Hint = styled.p`
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
`;

/** Alunos inativos (7+ dias sem acesso ou nunca acessaram). */
export function AttentionSection({ students }: { students: StudentProgress[] }) {
  if (students.length === 0) return null;

  const ordered = [...students].sort((a, b) => {
    const ta = a.lastAccessAt ? new Date(a.lastAccessAt).getTime() : 0;
    const tb = b.lastAccessAt ? new Date(b.lastAccessAt).getTime() : 0;
    return ta - tb; // mais parados primeiro
  });

  return (
    <Section>
      <Title>
        <Icon name="warning" size={14} />
        Precisam de atenção ({ordered.length})
      </Title>
      <Hint>Sem acesso nos últimos 7 dias — ou que nunca começaram.</Hint>
      {ordered.map((s) => <StudentRow key={s.id} student={s} highlightAccess />)}
    </Section>
  );
}
