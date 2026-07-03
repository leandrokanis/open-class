'use client';

import styled from 'styled-components';
import { StudentRow, type StudentProgress } from './StudentRow';

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h3`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
`;

const Empty = styled.p`
  font-size: 13px;
  color: var(--color-text-tertiary);
  padding: 8px 4px;
`;

/** Alunos ativos, ordenados por atividade mais recente. */
export function StudentList({ students }: { students: StudentProgress[] }) {
  const ordered = [...students].sort((a, b) => {
    const ta = a.lastAccessAt ? new Date(a.lastAccessAt).getTime() : 0;
    const tb = b.lastAccessAt ? new Date(b.lastAccessAt).getTime() : 0;
    return tb - ta;
  });

  return (
    <Section>
      <Title>Alunos ({ordered.length})</Title>
      {ordered.length === 0
        ? <Empty>Nenhum aluno ativo no momento.</Empty>
        : ordered.map((s) => <StudentRow key={s.id} student={s} />)}
    </Section>
  );
}
