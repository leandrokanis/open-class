'use client';

import styled from 'styled-components';
import type { LessonData } from '@/lib/instructor';

const Row = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 8px 24px;
  border-radius: 6px;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? '#eff6ff' : 'transparent')};
  border-left: 3px solid ${({ $selected }) => ($selected ? '#3b82f6' : 'transparent')};
  transition: background 0.1s;

  &:hover {
    background: ${({ $selected }) => ($selected ? '#eff6ff' : '#f1f5f9')};
  }
`;

const Title = styled.span<{ $selected: boolean }>`
  font-size: 13px;
  color: ${({ $selected }) => ($selected ? '#1d4ed8' : '#334155')};
  font-weight: ${({ $selected }) => ($selected ? '500' : '400')};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 8px;
`;

const Duration = styled.span`
  font-size: 12px;
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
`;

const DraftBadge = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 4px;
  padding: 1px 6px;
`;

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface LessonRowProps {
  lesson: LessonData;
  selected: boolean;
  onClick: () => void;
}

export default function LessonRow({ lesson, selected, onClick }: LessonRowProps) {
  return (
    <Row $selected={selected} onClick={onClick}>
      <Title $selected={selected}>{lesson.title}</Title>
      <Meta>
        {lesson.visibility === 'hidden' && <DraftBadge>Rascunho</DraftBadge>}
        {lesson.duration && <Duration>{formatDuration(lesson.duration)}</Duration>}
      </Meta>
    </Row>
  );
}
