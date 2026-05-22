'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { createModule } from '@/lib/instructor';
import type { ModuleWithLessons } from '@/lib/instructor';
import SectionRow from './SectionRow';

const Panel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
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

interface CurriculumPanelProps {
  courseId: string;
  sections: ModuleWithLessons[];
  selectedLessonId: string | null;
  onSelectLesson: (id: string) => void;
  onAddLesson: (moduleId: string) => void;
  onSectionsChange: (sections: ModuleWithLessons[]) => void;
}

export default function CurriculumPanel({
  courseId,
  sections,
  selectedLessonId,
  onSelectLesson,
  onAddLesson,
  onSectionsChange,
}: CurriculumPanelProps) {
  const [autoEditId, setAutoEditId] = useState<string | null>(null);

  async function handleAddSection() {
    const created = await createModule(courseId, 'Nova Seção');
    if (created) {
      onSectionsChange([...sections, created]);
      setAutoEditId(created.id);
    }
  }

  function handleSectionDeleted(moduleId: string) {
    onSectionsChange(sections.filter((s) => s.id !== moduleId));
  }

  function handleSectionRenamed(moduleId: string, title: string) {
    if (autoEditId === moduleId) setAutoEditId(null);
    onSectionsChange(
      sections.map((s) => (s.id === moduleId ? { ...s, title } : s)),
    );
  }

  function handleLessonRenamed(lessonId: string, title: string) {
    onSectionsChange(
      sections.map((s) => ({
        ...s,
        lessons: (s.lessons ?? []).map((l) => (l.id === lessonId ? { ...l, title } : l)),
      })),
    );
  }

  return (
    <Panel>
      <Header>
        <PanelTitle>Currículo</PanelTitle>
        <AddSectionBtn size="sm" variant="ghost" onClick={handleAddSection} title="Nova seção">
          <Icon name="add" size={16} />
        </AddSectionBtn>
      </Header>

      <Tree>
        {sections.length === 0 ? (
          <EmptyHint>
            Nenhuma seção ainda.<br />
            Clique em <Icon name="add" size={12} style={{ verticalAlign: 'middle' }} /> para criar.
          </EmptyHint>
        ) : (
          sections.map((section) => (
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
              autoEdit={section.id === autoEditId}
            />
          ))
        )}
      </Tree>
    </Panel>
  );
}
