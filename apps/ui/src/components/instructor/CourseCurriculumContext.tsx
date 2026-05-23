'use client';

import React, {
  createContext,
  useContext,
  useState,
  useReducer,
  useCallback,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { createLesson } from '@/lib/instructor';
import type { ModuleWithLessons, LessonData } from '@/lib/instructor';
import CurriculumPanel from './CurriculumPanel';
import { useSidebarSlot } from './SidebarSlotContext';
import { CourseEditorContext } from '@/app/instructor/cursos/[id]/layout';

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
          ? { ...s, lessons: [...(s.lessons ?? []), action.lesson] }
          : s,
      );
    case 'UPDATE_LESSON':
      return state.map((s) => ({
        ...s,
        lessons: (s.lessons ?? []).map((l) => (l.id === action.lesson.id ? action.lesson : l)),
      }));
    case 'DELETE_LESSON':
      return state.map((s) => ({
        ...s,
        lessons: (s.lessons ?? []).filter((l) => l.id !== action.lessonId),
      }));
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface CourseCurriculumCtx {
  sections: ModuleWithLessons[];
  loading: boolean;
  selectedLessonId: string | null;
  autoEditLessonId: string | null;
  setSelectedLessonId: (id: string | null) => void;
  dispatch: React.Dispatch<Action>;
  handleAddLesson: (moduleId: string) => Promise<void>;
  handleLessonDeleted: (lessonId: string) => void;
  handleLessonUpdated: (lesson: LessonData) => void;
}

const CourseCurriculumContext = createContext<CourseCurriculumCtx>({
  sections: [],
  loading: true,
  selectedLessonId: null,
  autoEditLessonId: null,
  setSelectedLessonId: () => {},
  dispatch: () => {},
  handleAddLesson: async () => {},
  handleLessonDeleted: () => {},
  handleLessonUpdated: () => {},
});

export function useCourseCurriculum() {
  return useContext(CourseCurriculumContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

interface Props {
  courseId: string;
  children: React.ReactNode;
}

export function CourseCurriculumProvider({ courseId, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { target, setHasPanel } = useSidebarSlot();
  const editorCtx = useContext(CourseEditorContext);

  const [sections, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [autoEditLessonId, setAutoEditLessonId] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  useEffect(() => {
    setHasPanel(true);
    return () => setHasPanel(false);
  }, [setHasPanel]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${apiBase}/api/courses/${courseId}`, { credentials: 'include' });
      if (!res.ok) { setLoading(false); return; }
      const json = await res.json();
      dispatch({ type: 'SET_SECTIONS', payload: json.data.modules ?? [] });
      if (json.data.slug) editorCtx?.setSlug(json.data.slug);
      setLoading(false);
    }
    load();
  }, [courseId, apiBase]);

  const aulasPath = `/instructor/cursos/${courseId}/aulas`;

  const handleSelectLesson = useCallback((id: string) => {
    setSelectedLessonId(id);
    if (pathname !== aulasPath) {
      router.push(aulasPath);
    }
  }, [pathname, aulasPath, router]);

  const handleAddLesson = useCallback(async (moduleId: string) => {
    const lesson = await createLesson(moduleId, { title: 'Nova Aula' });
    if (lesson) {
      dispatch({ type: 'ADD_LESSON', moduleId, lesson });
      setSelectedLessonId(lesson.id);
      setAutoEditLessonId(lesson.id);
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

  const curriculumPanel = (
    <CurriculumPanel
      courseId={courseId}
      sections={sections}
      selectedLessonId={selectedLessonId}
      autoEditLessonId={autoEditLessonId}
      onSelectLesson={handleSelectLesson}
      onAddLesson={handleAddLesson}
      onLessonDeleted={handleLessonDeleted}
      onSectionsChange={(updated) => dispatch({ type: 'SET_SECTIONS', payload: updated })}
      onLessonAutoEditDone={() => setAutoEditLessonId(null)}
    />
  );

  return (
    <CourseCurriculumContext.Provider
      value={{
        sections,
        loading,
        selectedLessonId,
        autoEditLessonId,
        setSelectedLessonId,
        dispatch,
        handleAddLesson,
        handleLessonDeleted,
        handleLessonUpdated,
      }}
    >
      {target && createPortal(curriculumPanel, target)}
      {children}
    </CourseCurriculumContext.Provider>
  );
}
