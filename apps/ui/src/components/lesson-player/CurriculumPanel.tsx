import styled from "styled-components";
import { CurriculumModule } from "./CurriculumModule";

const Panel = styled.div`
  background: var(--color-surface);
  overflow-y: auto;
`;

const PanelHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
`;

const PanelTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
`;

const PanelMeta = styled.p`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

interface Lesson {
  id: string;
  title: string;
  durationSeconds: number | null;
  position: number;
  isExtra?: boolean;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CurriculumPanelProps {
  modules: Module[];
  activeLessonId: string;
  completedLessonIds: string[];
  percentage: number;
  totalLessons: number;
  completedCount: number;
  onLessonClick: (lessonId: string) => void;
  showHeader?: boolean;
  /** moduleId → extras desbloqueadas para o aluno */
  extrasUnlockedByModule?: Record<string, boolean>;
  /** moduleId → data de liberação do cronograma da turma (US-24) */
  moduleLocks?: Record<string, string>;
}

export function CurriculumPanel({
  modules,
  activeLessonId,
  completedLessonIds,
  percentage,
  totalLessons,
  completedCount,
  onLessonClick,
  showHeader = true,
  extrasUnlockedByModule = {},
  moduleLocks = {},
}: CurriculumPanelProps) {
  const activeModuleId = modules.find((m) => m.lessons.some((l) => l.id === activeLessonId))?.id;

  return (
    <Panel>
      {showHeader && (
        <PanelHeader>
          <PanelTitle>Conteúdo do curso</PanelTitle>
          <PanelMeta>
            {completedCount} de {totalLessons} aulas · {Math.round(percentage)}% concluído
          </PanelMeta>
        </PanelHeader>
      )}
      {modules.map((module) => (
        <CurriculumModule
          key={module.id}
          module={module}
          activeLessonId={activeLessonId}
          completedLessonIds={completedLessonIds}
          onLessonClick={onLessonClick}
          defaultOpen={module.id === activeModuleId}
          extrasUnlocked={extrasUnlockedByModule[module.id] ?? false}
          lockedUntil={moduleLocks[module.id] ?? null}
        />
      ))}
    </Panel>
  );
}
