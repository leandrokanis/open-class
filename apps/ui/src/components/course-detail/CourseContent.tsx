"use client";

import { useState } from "react";
import styled from "styled-components";
import type { CourseModule } from "@/lib/course-detail";
import { LessonRow } from "./LessonRow";

function formatModuleDuration(lessons: { duration: number | null }[]): string {
  const totalSeconds = lessons.reduce((acc, l) => acc + (l.duration ?? 0), 0);
  const m = Math.round(totalSeconds / 60);
  if (m === 0) return "";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

const Section = styled.div`
  padding: 24px 20px 0;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: var(--font-inter), system-ui, sans-serif;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModuleCount = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const ToggleAll = styled.button`
  font-size: 13px;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;

  &:hover {
    text-decoration: underline;
  }
`;

const ModuleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ModuleCard = styled.div`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
  background: var(--color-surface);
`;

const ModuleHeader = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: var(--color-surface-secondary);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border: none;
  text-align: left;

  &:hover {
    background: var(--color-surface-tertiary, var(--color-surface-secondary));
  }
`;

const ModuleInfo = styled.div`
  flex: 1;
`;

const ModuleTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: block;
`;

const ModuleMeta = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const ChevronIcon = styled.svg<{ $open: boolean }>`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
  transition: transform 0.2s;
`;

const LessonList = styled.div`
  border-top: 1px solid var(--color-border);

  & > div + div {
    border-top: 1px solid var(--color-border);
  }
`;

interface CourseContentProps {
  modules: CourseModule[];
  completedLessonIds: string[];
}

export function CourseContent({ modules }: CourseContentProps) {
  const allIds = modules.map((m) => m.id);
  const [openModules, setOpenModules] = useState<Set<string>>(
    () => new Set(modules[0] ? [modules[0].id] : []),
  );

  const allOpen = openModules.size === modules.length;

  function toggle(moduleId: string) {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  function toggleAll() {
    setOpenModules(allOpen ? new Set() : new Set(allIds));
  }

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Conteúdo do curso</SectionTitle>
        <HeaderRight>
          <ModuleCount>{modules.length} módulos</ModuleCount>
          <ToggleAll onClick={toggleAll}>
            {allOpen ? "Colapsar todos" : "Expandir todos"}
          </ToggleAll>
        </HeaderRight>
      </SectionHeader>

      <ModuleList>
        {modules.map((mod) => {
          const isOpen = openModules.has(mod.id);
          const duration = formatModuleDuration(mod.lessons);

          return (
            <ModuleCard key={mod.id}>
              <ModuleHeader onClick={() => toggle(mod.id)} aria-expanded={isOpen}>
                <ModuleInfo>
                  <ModuleTitle>{mod.title}</ModuleTitle>
                  <ModuleMeta>
                    {mod.lessons.length} aulas{duration ? ` · ${duration}` : ""}
                  </ModuleMeta>
                </ModuleInfo>
                <ChevronIcon $open={isOpen} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </ChevronIcon>
              </ModuleHeader>

              {isOpen && (
                <LessonList>
                  {mod.lessons.map((lesson) => (
                    <LessonRow key={lesson.id} lesson={lesson} />
                  ))}
                </LessonList>
              )}
            </ModuleCard>
          );
        })}
      </ModuleList>
    </Section>
  );
}
