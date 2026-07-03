'use client';

import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 28px;
  height: 44px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-secondary);
  flex-shrink: 0;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const CourseName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
`;

const Sep = styled.span`
  color: var(--color-text-tertiary);
  font-size: 13px;
  flex-shrink: 0;
`;

const Current = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
`;

/** Rótulo da subpágina atual a partir do pathname. */
function subpageLabel(pathname: string, courseId: string): string {
  const base = `/instructor/courses/${courseId}`;
  if (pathname.startsWith(`${base}/settings`)) return 'Configurações';
  if (pathname.startsWith(`${base}/students`)) return 'Alunos';
  if (pathname.startsWith(`${base}/cohorts`)) return 'Turmas';
  if (pathname.startsWith(`${base}/lessons`)) return 'Aulas';
  return 'Curso';
}

interface CourseTopBarProps {
  courseId: string;
  courseName: string;
  slug: string;
}

export function CourseTopBar({ courseId, courseName, slug }: CourseTopBarProps) {
  const pathname = usePathname();
  const current = subpageLabel(pathname ?? '', courseId);

  return (
    <Bar>
      <Breadcrumb>
        <CourseName>{courseName || 'Curso'}</CourseName>
        <Sep>›</Sep>
        <Current>{current}</Current>
      </Breadcrumb>

      <Button
        size="sm"
        variant="outline"
        onClick={() => slug && window.open(`/course/${slug}`, '_blank')}
        disabled={!slug}
      >
        <Icon name="open_in_new" size={13} />
        Preview
      </Button>
    </Bar>
  );
}
