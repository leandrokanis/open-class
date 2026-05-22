"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled, { keyframes } from "styled-components";
import type { CourseDetail, CourseModule } from "@/lib/course-detail";
import { enrollInCourse } from "@/lib/course-detail";
import { Icon } from "@/components/ui/Icon";

const fadeIn = keyframes`
  from { opacity: 0 }
  to   { opacity: 1 }
`;

const slideUp = keyframes`
  from { transform: translateY(100%) }
  to   { transform: translateY(0) }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: var(--color-overlay-medium);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: ${fadeIn} 0.15s ease;

  @media (min-width: 768px) {
    align-items: center;
  }
`;

const Sheet = styled.div`
  background: var(--color-surface);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.25s ease;

  @media (min-width: 768px) {
    border-radius: var(--radius-card);
    width: 440px;
    max-height: none;
    animation: ${fadeIn} 0.15s ease;
  }
`;

const HeroStrip = styled.div`
  height: 8px;
  background: var(--gradient-hero, var(--color-primary));
  border-radius: 20px 20px 0 0;

  @media (min-width: 768px) {
    border-radius: var(--radius-card) var(--radius-card) 0 0;
  }
`;

const Body = styled.div`
  padding: 20px 20px 32px;
`;

const CloseRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-tertiary);
  padding: 4px;
  display: flex;
  align-items: center;

  &:hover {
    color: var(--color-text-secondary);
  }
`;

const Label = styled.p`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-primary);
  margin-bottom: 6px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text-primary);
  line-height: 1.3;
  margin-bottom: 4px;
  font-family: var(--font-inter), system-ui, sans-serif;
`;

const Instructor = styled.p`
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const Stat = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const FreeBadge = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: var(--color-success);
  background: rgba(34, 197, 94, 0.1);
  padding: 3px 10px;
  border-radius: var(--radius-chip);
`;

const Divider = styled.span`
  color: var(--color-border);
  font-size: 16px;
`;

const ConfirmBtn = styled.button<{ $loading: boolean }>`
  width: 100%;
  padding: 15px;
  background: ${({ $loading }) => ($loading ? "var(--color-text-tertiary)" : "var(--color-primary)")};
  color: #ffffff;
  border: none;
  border-radius: var(--radius-btn);
  font-size: 15px;
  font-weight: 700;
  cursor: ${({ $loading }) => ($loading ? "not-allowed" : "pointer")};
  font-family: var(--font-inter), system-ui, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.92;
  }
`;

const ErrorMsg = styled.p`
  font-size: 13px;
  color: var(--color-destructive);
  margin-top: 10px;
  text-align: center;
`;

const spin = keyframes`
  to { transform: rotate(360deg) }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

interface EnrollmentModalProps {
  course: CourseDetail;
  modules: CourseModule[];
  onClose: () => void;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

export function EnrollmentModal({ course, modules, onClose }: EnrollmentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalMinutes = modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + Math.round((l.duration ?? 0) / 60), 0),
    0,
  );

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await enrollInCourse(course.id);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao realizar inscrição. Tente novamente.");
      setLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <Backdrop onClick={handleBackdropClick}>
      <Sheet onClick={(e) => e.stopPropagation()}>
        <HeroStrip />
        <Body>
          <CloseRow>
            <CloseBtn onClick={onClose} aria-label="Fechar">
              <Icon name="close" size={20} />
            </CloseBtn>
          </CloseRow>

          <Label>Inscrição gratuita</Label>
          <Title>{course.title}</Title>
          <Instructor>por {course.instructor.name}</Instructor>

          <Stats>
            {totalLessons > 0 && (
              <Stat>
                <Icon name="play_lesson" size={14} style={{ color: "var(--color-text-tertiary)" }} />
                {totalLessons} aulas
              </Stat>
            )}
            {totalLessons > 0 && totalMinutes > 0 && <Divider>·</Divider>}
            {totalMinutes > 0 && (
              <Stat>
                <Icon name="schedule" size={14} style={{ color: "var(--color-text-tertiary)" }} />
                {formatDuration(totalMinutes)}
              </Stat>
            )}
            {(totalLessons > 0 || totalMinutes > 0) && <Divider>·</Divider>}
            <FreeBadge>Grátis</FreeBadge>
          </Stats>

          <ConfirmBtn onClick={handleConfirm} disabled={loading} $loading={loading}>
            {loading ? <Spinner /> : "Confirmar inscrição"}
          </ConfirmBtn>

          {error && <ErrorMsg>{error}</ErrorMsg>}
        </Body>
      </Sheet>
    </Backdrop>
  );
}
