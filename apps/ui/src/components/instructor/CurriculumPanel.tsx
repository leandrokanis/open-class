'use client';

import styled from 'styled-components';
import { Button } from '@/components/ui/button';
import { createModule } from '@/lib/instructor';
import type { ModuleWithLessons } from '@/lib/instructor';
import SectionRow from './SectionRow';

const Panel = styled.div`
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px 8px;
  border-bottom: 1px solid #f1f5f9;
`;

const PanelTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;


const Sections = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  gap: 2px;
`;

const Footer = styled.div`
  padding: 12px;
  border-top: 1px solid #f1f5f9;
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
  async function handleAddSection() {
    const created = await createModule(courseId, 'Nova Seção');
    if (created) {
      onSectionsChange([...sections, created]);
    }
  }

  function handleSectionDeleted(moduleId: string) {
    onSectionsChange(sections.filter((s) => s.id !== moduleId));
  }

  function handleSectionRenamed(moduleId: string, title: string) {
    onSectionsChange(
      sections.map((s) => (s.id === moduleId ? { ...s, title } : s)),
    );
  }

  return (
    <Panel>
      <Header>
        <PanelTitle>Currículo</PanelTitle>
        <Button size="sm" variant="outline" onClick={handleAddSection}>+ Seção</Button>
      </Header>
      <Sections>
        {sections.map((section) => (
          <SectionRow
            key={section.id}
            courseId={courseId}
            section={section}
            selectedLessonId={selectedLessonId}
            onSelectLesson={onSelectLesson}
            onAddLesson={onAddLesson}
            onDeleted={handleSectionDeleted}
            onRenamed={handleSectionRenamed}
          />
        ))}
      </Sections>
      <Footer>
        <Button size="sm" variant="outline" onClick={handleAddSection} style={{ width: '100%' }}>+ Adicionar seção</Button>
      </Footer>
    </Panel>
  );
}
