"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { fetchCourseProgress, fetchCompletedLessons, type CourseModule } from "@/lib/course-detail";
import { CourseDetailSkeleton } from "./CourseDetailSkeleton";

const Wrapper = styled.div`
  padding: 20px;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProgressText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const ProgressPercent = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
`;

const ProgressTrack = styled.div`
  height: 8px;
  background: var(--color-surface-secondary);
  border-radius: var(--radius-progress, 4px);
  overflow: hidden;
  margin-bottom: 6px;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: var(--color-primary);
  border-radius: inherit;
  transition: width 0.4s ease;
`;

const ProgressSubtext = styled.p`
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
`;

const CtaButton = styled.button`
  width: 100%;
  padding: 15px;
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-btn);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-inter), system-ui, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    opacity: 0.92;
  }
`;

interface CourseProgressSectionProps {
  courseId: string;
  modules: CourseModule[];
  onCompletedLessonsLoaded?: (ids: string[]) => void;
}

function findNextLesson(
  modules: CourseModule[],
  completedIds: Set<string>,
): { title: string; number: number } | null {
  let lessonNumber = 0;
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      lessonNumber++;
      if (!completedIds.has(lesson.id)) {
        return { title: lesson.title, number: lessonNumber };
      }
    }
  }
  return null;
}

export function CourseProgressSection({
  courseId,
  modules,
  onCompletedLessonsLoaded,
}: CourseProgressSectionProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<{
    percentage: number;
    completedLessons: number;
    totalLessons: number;
  } | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const [prog, lessonIds] = await Promise.all([
        fetchCourseProgress(courseId),
        fetchCompletedLessons(courseId),
      ]);
      setProgress(prog);
      const idSet = new Set(lessonIds);
      setCompletedIds(idSet);
      onCompletedLessonsLoaded?.(lessonIds);
      setLoading(false);
    }
    void load();
  }, [courseId, onCompletedLessonsLoaded]);

  if (loading) return <CourseDetailSkeleton />;

  if (!progress) {
    return (
      <Wrapper>
        <CtaButton>▶ Começar curso — GRÁTIS</CtaButton>
      </Wrapper>
    );
  }

  const nextLesson = findNextLesson(modules, completedIds);
  const isComplete = progress.percentage >= 100;

  return (
    <Wrapper>
      <ProgressLabel>
        <ProgressText>Seu progresso</ProgressText>
        <ProgressPercent>{Math.round(progress.percentage)}%</ProgressPercent>
      </ProgressLabel>

      <ProgressTrack>
        <ProgressFill $pct={progress.percentage} />
      </ProgressTrack>

      <ProgressSubtext>
        {progress.completedLessons} de {progress.totalLessons} aulas concluídas
      </ProgressSubtext>

      <CtaButton>
        {isComplete
          ? "↺ Rever curso"
          : nextLesson
            ? `▶ Continuar — Aula ${nextLesson.number}`
            : "▶ Começar curso"}
      </CtaButton>
    </Wrapper>
  );
}
