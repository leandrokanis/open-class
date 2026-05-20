'use client';

import { useState, useRef } from 'react';
import styled from 'styled-components';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { deleteModule, updateModule } from '@/lib/instructor';
import type { ModuleWithLessons, LessonData } from '@/lib/instructor';
import LessonRow from './LessonRow';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;

  &:hover {
    background: #f1f5f9;
  }
`;

const Chevron = styled.span<{ $open: boolean }>`
  font-size: 12px;
  color: #64748b;
  transition: transform 0.15s;
  transform: rotate(${({ $open }) => ($open ? '90deg' : '0deg')});
  flex-shrink: 0;
`;

const TitleText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;


const HoverDeleteBtn = styled.div`
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;

  ${Wrapper}:hover & {
    opacity: 1;
  }
`;

const Lessons = styled.div`
  display: flex;
  flex-direction: column;
`;

interface SectionRowProps {
  courseId: string;
  section: ModuleWithLessons;
  selectedLessonId: string | null;
  onSelectLesson: (id: string) => void;
  onAddLesson: (moduleId: string) => void;
  onDeleted: (moduleId: string) => void;
  onRenamed: (moduleId: string, title: string) => void;
}

export default function SectionRow({
  courseId,
  section,
  selectedLessonId,
  onSelectLesson,
  onAddLesson,
  onDeleted,
  onRenamed,
}: SectionRowProps) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(section.title);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    setDraftTitle(section.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  async function commitRename() {
    setEditing(false);
    const trimmed = draftTitle.trim();
    if (!trimmed || trimmed === section.title) return;
    await updateModule(courseId, section.id, { title: trimmed });
    onRenamed(section.id, trimmed);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm(`Excluir a seção "${section.title}"? As aulas serão removidas.`)) return;
    const ok = await deleteModule(courseId, section.id);
    if (ok) onDeleted(section.id);
  }

  return (
    <Wrapper>
      <Header onClick={() => setOpen((o) => !o)}>
        <Chevron $open={open}>▶</Chevron>
        {editing ? (
          <Input
            ref={inputRef}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setEditing(false);
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            style={{ flex: 1, minWidth: 0, height: 28, padding: '2px 8px', fontSize: 13 }}
          />
        ) : (
          <TitleText onDoubleClick={handleDoubleClick}>{section.title}</TitleText>
        )}
        <HoverDeleteBtn>
          <Button size="sm" variant="ghost" onClick={handleDelete} title="Excluir seção" style={{ padding: '2px 6px', color: '#94a3b8' }}>✕</Button>
        </HoverDeleteBtn>
      </Header>
      {open && (
        <Lessons>
          {section.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              selected={lesson.id === selectedLessonId}
              onClick={() => onSelectLesson(lesson.id)}
            />
          ))}
          <Button size="sm" variant="ghost" onClick={() => onAddLesson(section.id)} style={{ marginLeft: 12, justifyContent: 'flex-start', fontSize: 12 }}>
            + Adicionar aula
          </Button>
        </Lessons>
      )}
    </Wrapper>
  );
}
