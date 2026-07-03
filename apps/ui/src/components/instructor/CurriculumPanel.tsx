'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { toast } from 'sonner';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type DragCancelEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/Icon';
import { createModule, reorderModules, reorderLessons, moveLesson } from '@/lib/instructor';
import type { ModuleWithLessons, LessonData } from '@/lib/instructor';
import SectionRow from './SectionRow';
import DragGhost from './DragGhost';

const Panel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const CourseTabs = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
`;

const CourseTab = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  color: ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--color-text-secondary)')};
  background: ${({ $active }) => ($active ? 'var(--color-primary-light)' : 'transparent')};
  border-left: 2px solid ${({ $active }) => ($active ? 'var(--color-primary)' : 'transparent')};
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: ${({ $active }) => ($active ? 'var(--color-primary-light)' : 'var(--color-surface-tertiary)')};
    color: ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--color-text-primary)')};
  }
`;

const SearchWrap = styled.div`
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 8px 12px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
`;

const PanelTitle = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const AddSectionBtn = styled(Button)`
  padding: 2px 6px;
  height: auto;
  color: var(--color-text-secondary);

  &:hover {
    color: var(--color-text-primary);
  }
`;

const Tree = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
`;

const EmptyHint = styled.div`
  padding: 24px 16px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.6;
`;

type ActiveItem =
  | { kind: 'section'; data: ModuleWithLessons }
  | { kind: 'lesson'; data: LessonData };

interface CurriculumPanelProps {
  courseId: string;
  sections: ModuleWithLessons[];
  selectedLessonId: string | null;
  autoEditLessonId?: string | null;
  onSelectLesson: (id: string) => void;
  onAddLesson: (moduleId: string) => void;
  onLessonDeleted?: (lessonId: string) => void;
  onSectionsChange: (sections: ModuleWithLessons[]) => void;
  onLessonAutoEditDone?: () => void;
}

export default function CurriculumPanel({
  courseId,
  sections: sectionsProp,
  selectedLessonId,
  autoEditLessonId,
  onSelectLesson,
  onAddLesson,
  onLessonDeleted,
  onSectionsChange,
  onLessonAutoEditDone,
}: CurriculumPanelProps) {
  const pathname = usePathname();
  const [autoEditId, setAutoEditId] = useState<string | null>(null);
  const [sections, setSections] = useState<ModuleWithLessons[]>(sectionsProp);
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const snapshotRef = useRef<ModuleWithLessons[]>([]);
  // Capture source sectionId at drag start — active.data.current mutates on re-renders
  const sourceSectionRef = useRef<string | null>(null);

  useEffect(() => {
    setSections(sectionsProp);
  }, [sectionsProp]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  async function handleAddSection() {
    const created = await createModule(courseId, 'Nova Seção');
    if (created) {
      const next = [...sections, created];
      setSections(next);
      onSectionsChange(next);
      setAutoEditId(created.id);
    }
  }

  function handleSectionDeleted(moduleId: string) {
    const next = sections.filter((s) => s.id !== moduleId);
    setSections(next);
    onSectionsChange(next);
  }

  function handleSectionRenamed(moduleId: string, title: string) {
    if (autoEditId === moduleId) setAutoEditId(null);
    const next = sections.map((s) => (s.id === moduleId ? { ...s, title } : s));
    setSections(next);
    onSectionsChange(next);
  }

  function handleLessonRenamed(lessonId: string, title: string) {
    const next = sections.map((s) => ({
      ...s,
      lessons: (s.lessons ?? []).map((l) => (l.id === lessonId ? { ...l, title } : l)),
    }));
    setSections(next);
    onSectionsChange(next);
  }

  function handleLessonDeleted(lessonId: string) {
    const next = sections.map((s) => ({
      ...s,
      lessons: (s.lessons ?? []).filter((l) => l.id !== lessonId),
    }));
    setSections(next);
    onSectionsChange(next);
    onLessonDeleted?.(lessonId);
  }

  function handleLessonVisibilityChange(lessonId: string, visibility: 'visible' | 'hidden') {
    const next = sections.map((s) => ({
      ...s,
      lessons: (s.lessons ?? []).map((l) => (l.id === lessonId ? { ...l, visibility } : l)),
    }));
    setSections(next);
    onSectionsChange(next);
  }

  // ── DnD handlers ──────────────────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    document.body.style.cursor = 'grabbing';
    snapshotRef.current = sections;

    const { active } = event;
    const kind = active.data.current?.kind as 'section' | 'lesson';
    sourceSectionRef.current = kind === 'lesson' ? (active.data.current?.sectionId ?? null) : null;

    if (kind === 'section') {
      const data = sections.find((s) => s.id === active.id);
      if (data) setActiveItem({ kind: 'section', data });
    } else {
      const data = sections.flatMap((s) => s.lessons ?? []).find((l) => l.id === active.id);
      if (data) setActiveItem({ kind: 'lesson', data });
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const kind = active.data.current?.kind;

    if (!over || kind !== 'lesson') {
      setDragOverSectionId(null);
      return;
    }

    const activeSectionId = active.data.current?.sectionId as string;
    const overKind = over.data.current?.kind;
    const overSectionId = overKind === 'lesson'
      ? (over.data.current?.sectionId as string)
      : (over.id as string);

    setDragOverSectionId(overSectionId ?? null);

    if (!overSectionId) return;

    if (activeSectionId === overSectionId) {
      // Same section: keep state in sync so handleDragEnd reads correct order
      if (overKind !== 'lesson' || over.id === active.id) return;
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== activeSectionId) return s;
          const lessons = s.lessons ?? [];
          const oldIdx = lessons.findIndex((l) => l.id === active.id);
          const newIdx = lessons.findIndex((l) => l.id === over.id);
          if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return s;
          return { ...s, lessons: arrayMove(lessons, oldIdx, newIdx) };
        }),
      );
      return;
    }

    // Cross-section: move lesson to target, inserting at correct position
    setSections((prev) => {
      const lesson = prev.flatMap((s) => s.lessons ?? []).find((l) => l.id === active.id);
      if (!lesson) return prev;
      return prev.map((s) => {
        if (s.id === activeSectionId) return { ...s, lessons: (s.lessons ?? []).filter((l) => l.id !== active.id) };
        if (s.id === overSectionId) {
          const targetLessons = (s.lessons ?? []).filter((l) => l.id !== active.id);
          if (overKind === 'lesson') {
            const overIdx = targetLessons.findIndex((l) => l.id === over.id);
            if (overIdx >= 0) {
              const next = [...targetLessons];
              next.splice(overIdx, 0, lesson);
              return { ...s, lessons: next };
            }
          }
          return { ...s, lessons: [...targetLessons, lesson] };
        }
        return s;
      });
    });
  }

  function handleDragCancel(_event: DragCancelEvent) {
    document.body.style.cursor = '';
    setActiveItem(null);
    setDragOverSectionId(null);
    setSections(snapshotRef.current);
    sourceSectionRef.current = null;
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    document.body.style.cursor = '';
    setDragOverSectionId(null);
    const { active, over } = event;
    setActiveItem(null);

    if (!over || active.id === over.id) {
      sourceSectionRef.current = null;
      return;
    }

    const kind = active.data.current?.kind as 'section' | 'lesson';

    if (kind === 'section') {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      // over might be a lesson inside an open section — resolve to its parent section
      const targetSectionId = over.data.current?.kind === 'lesson'
        ? (over.data.current?.sectionId as string)
        : (over.id as string);
      const newIndex = sections.findIndex((s) => s.id === targetSectionId);
      if (oldIndex === newIndex || newIndex === -1) return;

      const reordered = arrayMove(sections, oldIndex, newIndex);
      setSections(reordered);
      onSectionsChange(reordered);

      const ok = await reorderModules(courseId, reordered.map((s) => s.id));
      if (!ok) {
        setSections(snapshotRef.current);
        onSectionsChange(snapshotRef.current);
        toast.error('Erro ao salvar ordem das seções. Tente novamente.');
      }
      return;
    }

    // lesson — state already fully updated by handleDragOver (both same & cross section)
    const sourceSectionId = sourceSectionRef.current as string;
    sourceSectionRef.current = null;

    // Find which section now holds the lesson (may have changed cross-section)
    const currentSection = sections.find((s) => (s.lessons ?? []).some((l) => l.id === active.id));
    if (!currentSection) return;

    const lessons = currentSection.lessons ?? [];
    // Reordenação e posição são por grupo: normais e extras têm sequências independentes (US-21)
    const dragged = lessons.find((l) => l.id === active.id);
    const draggedIsExtra = dragged?.isExtra ?? false;
    const groupLessons = lessons.filter((l) => (l.isExtra ?? false) === draggedIsExtra);
    const position = groupLessons.findIndex((l) => l.id === active.id);
    const finalPosition = position >= 0 ? position + 1 : groupLessons.length;

    onSectionsChange(sections);

    if (sourceSectionId === currentSection.id) {
      const ok = await reorderLessons(currentSection.id, groupLessons.map((l) => l.id));
      if (!ok) {
        setSections(snapshotRef.current);
        onSectionsChange(snapshotRef.current);
        toast.error('Erro ao salvar ordem das aulas. Tente novamente.');
      }
    } else {
      const result = await moveLesson(active.id as string, currentSection.id, finalPosition);
      if (!result) {
        setSections(snapshotRef.current);
        onSectionsChange(snapshotRef.current);
        toast.error('Erro ao mover aula. Tente novamente.');
      }
    }
  }, [sections, courseId, onSectionsChange]);

  const sectionIds = sections.map((s) => s.id);

  const q = searchQuery.toLowerCase().trim();
  const filteredSections = q
    ? sections.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.lessons ?? []).some((l) => l.title.toLowerCase().includes(q)),
      )
    : sections;

  const basePath = `/instructor/courses/${courseId}`;
  const courseTabs = [
    { href: basePath,                       label: 'Curso',          icon: 'info' },
    { href: `${basePath}/settings`,    label: 'Configurações',  icon: 'tune' },
    { href: `${basePath}/students`,           label: 'Alunos',         icon: 'group' },
  ];

  return (
    <Panel>
      <CourseTabs>
        {courseTabs.map((tab) => (
          <CourseTab
            key={tab.href}
            href={tab.href}
            $active={pathname === tab.href}
          >
            <Icon name={tab.icon} size={14} />
            {tab.label}
          </CourseTab>
        ))}
      </CourseTabs>

      <SearchWrap>
        <Input
          placeholder="Buscar aulas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ height: '32px', fontSize: '12px' }}
        />
      </SearchWrap>

      <Header>
        <PanelTitle>Currículo</PanelTitle>
        <AddSectionBtn size="sm" variant="ghost" onClick={handleAddSection} title="Nova seção">
          <Icon name="add" size={16} />
        </AddSectionBtn>
      </Header>

      <Tree>
        {filteredSections.length === 0 ? (
          <EmptyHint>
            {q ? 'Nenhuma aula encontrada.' : (<>Nenhuma seção ainda.<br />Clique em <Icon name="add" size={12} style={{ verticalAlign: 'middle' }} /> para criar.</>)}
          </EmptyHint>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
              {filteredSections.map((section) => (
                <SectionRow
                  key={section.id}
                  courseId={courseId}
                  section={section}
                  selectedLessonId={selectedLessonId}
                  onSelectLesson={onSelectLesson}
                  onAddLesson={onAddLesson}
                  onDeleted={handleSectionDeleted}
                  onRenamed={handleSectionRenamed}
                  onLessonRenamed={handleLessonRenamed}
                  onLessonDeleted={handleLessonDeleted}
                  onLessonVisibilityChange={handleLessonVisibilityChange}
                  onLessonAutoEditDone={onLessonAutoEditDone}
                  autoEditLessonId={autoEditLessonId}
                  dragOver={section.id === dragOverSectionId}
                  autoEdit={section.id === autoEditId}
                />
              ))}
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeItem && (
                <DragGhost kind={activeItem.kind} data={activeItem.data} />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </Tree>
    </Panel>
  );
}
