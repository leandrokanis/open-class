'use client';

import { use, useState, useReducer, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { createLesson } from '@/lib/instructor';
import type { ModuleWithLessons, LessonData } from '@/lib/instructor';
import CurriculumPanel from '@/components/instructor/CurriculumPanel';
import LessonEditor, { LessonEditorEmpty } from '@/components/instructor/LessonEditor';

const SplitLayout = styled.div`
  display: flex;
  height: calc(100vh - 120px);
  overflow: hidden;
`;

const LoadingState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
`;

// ── Reducer ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_SECTIONS'; payload: ModuleWithLessons[] }
  | { type: 'ADD_LESSON'; moduleId: string; lesson: LessonData }
  | { type: 'UPDATE_LESSON'; lesson: LessonData }
  | { type: 'DELETE_LESSON'; lessonId: string };

function reducer(state: ModuleWithLessons[], action: Action): ModuleWithLessons[] {
  switch (action.type) {
    case 'SET_SECTIONS':
      return action.payload;
    case 'ADD_LESSON':
      return state.map((s) =>
        s.id === action.moduleId
          ? { ...s, lessons: [...s.lessons, action.lesson] }
          : s,
      );
    case 'UPDATE_LESSON':
      return state.map((s) => ({
        ...s,
        lessons: s.lessons.map((l) => (l.id === action.lesson.id ? action.lesson : l)),
      }));
    case 'DELETE_LESSON':
      return state.map((s) => ({
        ...s,
        lessons: s.lessons.filter((l) => l.id !== action.lessonId),
      }));
    default:
      return state;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface AulasPageProps {
  params: Promise<{ id: string }>;
}

export default function AulasPage({ params }: AulasPageProps) {
  const { id: courseId } = use(params);
  const router = useRouter();

  const [sections, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  useEffect(() => {
    async function load() {
      const res = await fetch(`${apiBase}/api/courses/${courseId}`, { credentials: 'include' });
      if (!res.ok) { setLoading(false); return; }
      const json = await res.json();
      dispatch({ type: 'SET_SECTIONS', payload: json.data.modules ?? [] });
      setLoading(false);
    }
    load();
  }, [courseId, apiBase]);

  const handleAddLesson = useCallback(async (moduleId: string) => {
    const lesson = await createLesson(moduleId, { title: 'Nova Aula' });
    if (lesson) {
      dispatch({ type: 'ADD_LESSON', moduleId, lesson });
      setSelectedLessonId(lesson.id);
    }
  }, []);

  const handleLessonUpdated = useCallback((lesson: LessonData) => {
    dispatch({ type: 'UPDATE_LESSON', lesson });
  }, []);

  const handleLessonDeleted = useCallback((lessonId: string) => {
    dispatch({ type: 'DELETE_LESSON', lessonId });
    setSelectedLessonId(null);
    router.refresh();
  }, [router]);

  const selectedLesson = sections
    .flatMap((s) => s.lessons)
    .find((l) => l.id === selectedLessonId) ?? null;

  if (loading) {
    return (
      <SplitLayout>
        <LoadingState>Carregando currículo...</LoadingState>
      </SplitLayout>
    );
  }

  return (
    <SplitLayout>
      <CurriculumPanel
        courseId={courseId}
        sections={sections}
        selectedLessonId={selectedLessonId}
        onSelectLesson={setSelectedLessonId}
        onAddLesson={handleAddLesson}
        onSectionsChange={(updated) => dispatch({ type: 'SET_SECTIONS', payload: updated })}
      />
      {selectedLesson ? (
        <LessonEditor
          lesson={selectedLesson}
          onDeleted={handleLessonDeleted}
          onUpdated={handleLessonUpdated}
        />
      ) : (
        <LessonEditorEmpty />
      )}
    </SplitLayout>
  );
}
