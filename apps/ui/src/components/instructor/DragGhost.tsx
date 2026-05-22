'use client';

import styled from 'styled-components';
import { Icon } from '@/components/ui/Icon';
import type { LessonData, ModuleWithLessons } from '@/lib/instructor';

const GhostRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  height: 26px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  opacity: 0.85;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  min-width: 180px;
  max-width: 280px;
`;

const GhostTitle = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const GhostIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  color: var(--color-text-secondary);
`;

interface DragGhostProps {
  kind: 'section' | 'lesson';
  data: ModuleWithLessons | LessonData;
}

export default function DragGhost({ kind, data }: DragGhostProps) {
  const iconName = kind === 'section' ? 'folder' : 'videocam';
  return (
    <GhostRow data-theme="dark">
      <GhostIcon>
        <Icon name={iconName} size={15} />
      </GhostIcon>
      <GhostTitle>{data.title}</GhostTitle>
    </GhostRow>
  );
}
