'use client';

import styled from 'styled-components';
import type { CohortProgress } from '@/lib/instructor';
import { relativeTime } from './relativeTime';

export type StudentProgress = CohortProgress['students'][number];

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 140px 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 10px 4px;
  border-bottom: 1px solid var(--color-border);

  &:last-child { border-bottom: none; }

  @media (max-width: 720px) {
    grid-template-columns: 1fr auto;
    gap: 8px;
  }
`;

const Person = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const Avatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--color-surface-tertiary);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Name = styled.span`
  font-size: 14px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Progress = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 720px) { display: none; }
`;

const Bar = styled.div`
  flex: 1;
  height: 5px;
  border-radius: 3px;
  background: var(--color-surface-tertiary);
  overflow: hidden;
`;

const Fill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $pct }) => ($pct >= 100 ? 'var(--color-success)' : 'var(--color-primary)')};
`;

const Pct = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  width: 34px;
  text-align: right;
`;

const LastLesson = styled.span`
  font-size: 12.5px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 720px) { display: none; }
`;

const Access = styled.span<{ $warn?: boolean }>`
  font-size: 12px;
  color: ${({ $warn }) => ($warn ? 'var(--color-destructive)' : 'var(--color-text-tertiary)')};
  white-space: nowrap;
`;

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export function StudentRow({ student, highlightAccess = false }: { student: StudentProgress; highlightAccess?: boolean }) {
  return (
    <Row>
      <Person>
        <Avatar>
          {student.avatarUrl ? <AvatarImg src={student.avatarUrl} alt="" /> : initials(student.name)}
        </Avatar>
        <Name>{student.name}</Name>
      </Person>
      <Progress>
        <Bar><Fill $pct={student.progressPct} /></Bar>
        <Pct>{Math.round(student.progressPct)}%</Pct>
      </Progress>
      <LastLesson>{student.lastLessonTitle ?? '—'}</LastLesson>
      <Access $warn={highlightAccess}>{relativeTime(student.lastAccessAt)}</Access>
    </Row>
  );
}
