'use client';

import { use } from 'react';
import styled from 'styled-components';
import LessonEditor, { LessonEditorEmpty } from '@/components/instructor/LessonEditor';
import { useCourseCurriculum } from '@/components/instructor/CourseCurriculumContext';

const EditorArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const LoadingState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 14px;
`;

interface AulasPageProps {
  params: Promise<{ id: string }>;
}

export default function AulasPage({ params }: AulasPageProps) {
  use(params); // courseId comes from context

  const {
    sections,
    loading,
    selectedLessonId,
    handleLessonDeleted,
    handleLessonUpdated,
  } = useCourseCurriculum();

  const selectedSection = sections.find((s) =>
    (s.lessons ?? []).some((l) => l.id === selectedLessonId),
  ) ?? null;

  const selectedLesson = selectedSection
    ? (selectedSection.lessons ?? []).find((l) => l.id === selectedLessonId) ?? null
    : null;

  if (loading) {
    return (
      <EditorArea>
        <LoadingState>Carregando currículo...</LoadingState>
      </EditorArea>
    );
  }

  return (
    <EditorArea>
      {selectedLesson ? (
        <LessonEditor
          lesson={selectedLesson}
          sectionLabel={selectedSection?.title ?? ''}
          onDeleted={handleLessonDeleted}
          onUpdated={handleLessonUpdated}
        />
      ) : (
        <LessonEditorEmpty />
      )}
    </EditorArea>
  );
}
