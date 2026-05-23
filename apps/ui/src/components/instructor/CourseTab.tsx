'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { CourseInfoForm } from './CourseInfoForm';
import { CourseSidePanel } from './CourseSidePanel';
import { usePropertiesPanel } from './PropertiesPanelContext';
import type { CourseEditorData, Category } from '@/lib/instructor';

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 40px 48px;
  max-width: 720px;
`;

interface CourseTabProps {
  course: CourseEditorData;
  categories: Category[];
}

export default function CourseTab({ course, categories }: CourseTabProps) {
  const { target, setHasPanel } = usePropertiesPanel();

  useEffect(() => {
    setHasPanel(true);
    return () => setHasPanel(false);
  }, [setHasPanel]);

  return (
    <>
      <ScrollArea>
        <CourseInfoForm course={course} />
      </ScrollArea>

      {target && createPortal(
        <CourseSidePanel course={course} categories={categories} />,
        target,
      )}
    </>
  );
}
