"use client";

import { useState } from "react";
import styled from "styled-components";
import { Icon } from "@/components/ui/Icon";
import { LessonRow } from "./LessonRow";

const ModuleWrap = styled.div`
  border-bottom: 1px solid var(--color-border);
`;

const ModuleHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 20px;
  background: var(--color-surface);
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;

  &:hover {
    background: var(--color-surface-secondary);
  }
`;

const ModuleNum = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  width: 16px;
  padding-top: 2px;
`;

const ModuleInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ModuleTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
`;

const ModuleMeta = styled.span`
  font-size: 12px;
  color: var(--color-text-tertiary);
`;

const LessonList = styled.div`
  background: var(--color-surface-secondary);
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

interface CurriculumModuleProps {
  module: Module;
  activeLessonId: string;
  completedLessonIds: string[];
  onLessonClick: (lessonId: string) => void;
  defaultOpen?: boolean;
  /** Extras do módulo desbloqueadas para o aluno (todas as normais concluídas) */
  extrasUnlocked?: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

const ExtrasDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary);
`;

export function CurriculumModule({
  module,
  activeLessonId,
  completedLessonIds,
  onLessonClick,
  defaultOpen = false,
  extrasUnlocked = false,
}: CurriculumModuleProps) {
  const [open, setOpen] = useState(defaultOpen);

  // Extras ficam fora dos totais: progresso e duração contam só as normais (US-20)
  const normalLessons = module.lessons.filter((l) => !l.isExtra);
  const extraLessons = module.lessons.filter((l) => l.isExtra);
  const totalLessons = normalLessons.length;
  const completedCount = normalLessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const totalSeconds = normalLessons.reduce((acc, l) => acc + (l.durationSeconds ?? 0), 0);
  const durationStr = totalSeconds > 0 ? ` · ${formatDuration(totalSeconds)}` : "";

  return (
    <ModuleWrap>
      <ModuleHeader onClick={() => setOpen((p) => !p)}>
        <ModuleNum>{module.order}</ModuleNum>
        <ModuleInfo>
          <ModuleTitle>{module.title}</ModuleTitle>
          <ModuleMeta>
            {completedCount} de {totalLessons} aulas{durationStr}
          </ModuleMeta>
        </ModuleInfo>
        <Icon
          name={open ? "expand_less" : "expand_more"}
          size={18}
          style={{ color: "var(--color-text-tertiary)", flexShrink: 0, marginTop: 2 }}
        />
      </ModuleHeader>
      {open && (
        <LessonList>
          {normalLessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              isCompleted={completedLessonIds.includes(lesson.id)}
              isActive={lesson.id === activeLessonId}
              onClick={() => onLessonClick(lesson.id)}
            />
          ))}
          {extraLessons.length > 0 && (
            <>
              <ExtrasDivider>
                <Icon name={extrasUnlocked ? "lock_open" : "lock"} size={12} />
                Aulas extras
              </ExtrasDivider>
              {extraLessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  isCompleted={completedLessonIds.includes(lesson.id)}
                  isActive={lesson.id === activeLessonId}
                  onClick={() => onLessonClick(lesson.id)}
                  locked={!extrasUnlocked}
                />
              ))}
            </>
          )}
        </LessonList>
      )}
    </ModuleWrap>
  );
}
