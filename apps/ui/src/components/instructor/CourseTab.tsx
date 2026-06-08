'use client';

import { useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { CourseInfoForm } from './CourseInfoForm';
import { CourseSidePanel } from './CourseSidePanel';
import { usePropertiesPanel } from './PropertiesPanelContext';
import { CourseEditorContext } from '@/app/instructor/cursos/[id]/layout';
import { Icon } from '@/components/ui/Icon';
import type { CourseEditorData, Category } from '@/lib/instructor';

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 40px 48px;
  max-width: 720px;
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
  margin-bottom: 20px;
  animation: ${fadeIn} 0.2s ease;
`;

interface CourseTabProps {
  course: CourseEditorData;
  categories: Category[];
}

export default function CourseTab({ course, categories }: CourseTabProps) {
  const { target, setHasPanel } = usePropertiesPanel();
  const ctx = useContext(CourseEditorContext);

  useEffect(() => {
    setHasPanel(true);
    return () => setHasPanel(false);
  }, [setHasPanel]);

  const savedTime = ctx?.savedAt
    ? ctx.savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <>
      <ScrollArea>
        {savedTime && (
          <SavedLabel key={savedTime}>
            <Icon name="check_circle" size={12} style={{ color: 'var(--color-success, #22c55e)' }} />
            Salvo às {savedTime}
          </SavedLabel>
        )}
        <CourseInfoForm course={course} />
      </ScrollArea>

      {target && createPortal(
        <CourseSidePanel course={course} categories={categories} />,
        target,
      )}
    </>
  );
}
