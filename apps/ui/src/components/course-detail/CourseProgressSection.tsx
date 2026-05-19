"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { fetchEnrollmentStatus, type CourseDetail, type CourseModule } from "@/lib/course-detail";
import { CourseDetailSkeleton } from "./CourseDetailSkeleton";
import { EnrollmentModal } from "./EnrollmentModal";
import { Icon } from "@/components/ui/Icon";

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

const EnrolledBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
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

  &:hover {
    opacity: 0.92;
  }
`;

interface CourseProgressSectionProps {
  course: CourseDetail;
  modules: CourseModule[];
  onCompletedLessonsLoaded?: (ids: string[]) => void;
}

function findNextLesson(
  modules: CourseModule[],
  completedIds: Set<string>,
): { number: number } | null {
  let n = 0;
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      n++;
      if (!completedIds.has(lesson.id)) return { number: n };
    }
  }
  return null;
}

export function CourseProgressSection({
  course,
  modules,
  onCompletedLessonsLoaded,
}: CourseProgressSectionProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{
    authenticated: boolean;
    enrolled: boolean;
    progress: { percentage: number; completedLessons: number; totalLessons: number } | null;
    completedIds: Set<string>;
  }>({ authenticated: false, enrolled: false, progress: null, completedIds: new Set() });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await fetchEnrollmentStatus(course.id);
      setStatus({
        authenticated: result.authenticated,
        enrolled: result.enrolled,
        progress: result.progress,
        completedIds: new Set(result.completedLessonIds),
      });
      onCompletedLessonsLoaded?.(result.completedLessonIds);
      setLoading(false);
    }
    void load();
  }, [course.id, onCompletedLessonsLoaded]);

  if (loading) return <CourseDetailSkeleton />;

  if (!status.enrolled) {
    const loginUrl = `/login?return=${encodeURIComponent(pathname)}`;

    function handleEnroll() {
      if (!status.authenticated) {
        window.location.href = loginUrl;
        return;
      }
      setModalOpen(true);
    }

    return (
      <>
        <Wrapper>
          <CtaButton onClick={handleEnroll}>Inscrever-se (GRÁTIS)</CtaButton>
        </Wrapper>
        {modalOpen && (
          <EnrollmentModal
            course={course}
            modules={modules}
            onClose={() => setModalOpen(false)}
          />
        )}
      </>
    );
  }

  const { progress, completedIds } = status;
  const nextLesson = progress ? findNextLesson(modules, completedIds) : null;
  const isComplete = (progress?.percentage ?? 0) >= 100;

  return (
    <Wrapper>
      {progress && (
        <>
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
        </>
      )}

      <EnrolledBadge>
        <Icon name="info" size={16} style={{ color: "var(--color-text-tertiary)" }} />
        Você está inscrito
      </EnrolledBadge>

      <CtaButton>
        {isComplete ? "Rever curso" : nextLesson ? `Continuar — Aula ${nextLesson.number}` : "Ir para o curso"}
      </CtaButton>
    </Wrapper>
  );
}
