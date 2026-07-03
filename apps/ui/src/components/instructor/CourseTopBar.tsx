'use client';

import { usePathname } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import type { ActiveLesson } from '@/app/instructor/courses/[id]/layout';

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
  max-width: 260px;
`;

const Sep = styled.span`
  color: var(--color-text-tertiary);
  font-size: 13px;
  flex-shrink: 0;
`;

const Crumb = styled.span<{ $dim?: boolean }>`
  font-size: 13px;
  color: ${({ $dim }) => ($dim ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

const VisibilityPill = styled.span<{ $visible: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 20px;
  color: ${({ $visible }) => ($visible ? 'var(--color-primary)' : 'var(--color-text-tertiary)')};
  background: ${({ $visible }) => ($visible ? 'var(--color-primary-light)' : 'var(--color-surface-tertiary)')};
  border: 1px solid ${({ $visible }) => ($visible ? 'rgba(232,160,69,0.3)' : 'var(--color-border)')};
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const SavedLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-tertiary);
  animation: ${fadeIn} 0.2s ease;
`;

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
  activeLesson: ActiveLesson | null;
  savedAt: Date | null;
}

export function CourseTopBar({ courseId, courseName, slug, activeLesson, savedAt }: CourseTopBarProps) {
  const pathname = usePathname();
  const onLessons = (pathname ?? '').startsWith(`/instructor/courses/${courseId}/lessons`);
  // Barra fundida: no editor de aula, o breadcrumb estende para seção › aula e a
  // barra ganha o status da aula (visibilidade + salvo) e o preview da própria aula.
  const editing = onLessons && activeLesson !== null;

  const previewHref = editing ? activeLesson!.previewHref : (slug ? `/course/${slug}` : null);
  const savedTime = savedAt
    ? savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <Bar>
      <Breadcrumb>
        <CourseName>{courseName || 'Curso'}</CourseName>
        {editing ? (
          <>
            {activeLesson!.sectionLabel && (
              <>
                <Sep>›</Sep>
                <Crumb $dim>{activeLesson!.sectionLabel}</Crumb>
              </>
            )}
            <Sep>›</Sep>
            <Crumb>{activeLesson!.title || 'Sem título'}</Crumb>
          </>
        ) : (
          <>
            <Sep>›</Sep>
            <Crumb>{subpageLabel(pathname ?? '', courseId)}</Crumb>
          </>
        )}
      </Breadcrumb>

      <Actions>
        {editing && (
          <>
            <VisibilityPill $visible={activeLesson!.visibility === 'visible'}>
              <Icon name={activeLesson!.visibility === 'visible' ? 'visibility' : 'draft'} size={11} />
              {activeLesson!.visibility === 'visible' ? 'Publicada' : 'Rascunho'}
            </VisibilityPill>
            {savedTime && (
              <SavedLabel key={savedTime}>
                <Icon name="check_circle" size={12} style={{ color: 'var(--color-success)' }} />
                Salvo {savedTime}
              </SavedLabel>
            )}
          </>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => previewHref && window.open(previewHref, '_blank')}
          disabled={!previewHref}
        >
          <Icon name="open_in_new" size={13} />
          Preview
        </Button>
      </Actions>
    </Bar>
  );
}
