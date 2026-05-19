"use client";

import styled from "styled-components";
import Link from "next/link";
import type { EnrollmentWithProgress } from "@/lib/dashboard";

const CATEGORY_GRADIENTS: Record<string, string> = {
  "dev-web": "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
  design: "linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)",
  dados: "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
  devops: "linear-gradient(135deg, #0f4c75 0%, #1a7abf 100%)",
  mobile: "linear-gradient(135deg, #155e75 0%, #06b6d4 100%)",
};
const DEFAULT_GRADIENT = "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#065f46",
  intermediate: "#1e40af",
  advanced: "#7c2d12",
};

const Card = styled.article<{ $featured?: boolean }>`
  display: flex;
  gap: 0;
  border-radius: var(--radius-card);
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  ${({ $featured }) => $featured && "border: 1.5px solid var(--color-primary);"}
`;

const Thumbnail = styled.div<{ $gradient: string; $featured?: boolean }>`
  flex-shrink: 0;
  width: ${({ $featured }) => ($featured ? "248px" : "160px")};
  background: ${({ $gradient }) => $gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (max-width: 767px) {
    width: 80px;
  }
`;

const DurationBadge = styled.span`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
`;

const PlayIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="rgba(255,255,255,0.15)" />
    <polygon points="13,10 24,16 13,22" fill="white" />
  </svg>
);

const Body = styled.div`
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
`;

const LevelBadge = styled.span<{ $color: string }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
  padding: 2px 6px;
  border-radius: 3px;
  background: ${({ $color }) => $color}22;
`;

const Title = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 767px) {
    font-size: 15px;
    white-space: normal;
  }
`;

const Instructor = styled.p`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
`;

const LessonsCount = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const Percentage = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
`;

const ProgressBar = styled.div<{ $pct: number; $color?: string }>`
  height: 4px;
  border-radius: var(--radius-progress);
  background: var(--color-border);
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${({ $pct }) => Math.min($pct, 100)}%;
    background: ${({ $color }) => $color ?? "var(--color-primary)"};
    border-radius: var(--radius-progress);
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  gap: 12px;
`;

const LastLesson = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContinueBtn = styled(Link)`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--radius-btn);
  background: var(--color-primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.88;
  }
`;

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

interface EnrolledCourseCardProps {
  enrollment: EnrollmentWithProgress;
  featured?: boolean;
}

export function EnrolledCourseCard({ enrollment, featured }: EnrolledCourseCardProps) {
  const { course, progress, lastLesson } = enrollment;
  const gradient =
    course.category?.slug
      ? (CATEGORY_GRADIENTS[course.category.slug] ?? DEFAULT_GRADIENT)
      : DEFAULT_GRADIENT;

  const levelColor = course.level ? (LEVEL_COLORS[course.level] ?? "#1e40af") : "#1e40af";
  const levelLabel = course.level ? (LEVEL_LABELS[course.level] ?? course.level) : null;

  const continueHref = lastLesson
    ? `/curso/${course.slug}`
    : `/curso/${course.slug}`;

  return (
    <Card $featured={featured}>
      <Thumbnail $gradient={gradient} $featured={featured}>
        <PlayIcon />
        {course.totalDurationMinutes > 0 && (
          <DurationBadge>{formatDuration(course.totalDurationMinutes)}</DurationBadge>
        )}
      </Thumbnail>

      <Body>
        <MetaRow>
          {course.category && (
            <CategoryLabel>{course.category.name}</CategoryLabel>
          )}
          {levelLabel && (
            <LevelBadge $color={levelColor}>· {levelLabel}</LevelBadge>
          )}
        </MetaRow>

        <Title title={course.title}>{course.title}</Title>
        <Instructor>por {course.instructor.name}</Instructor>

        <ProgressRow>
          <LessonsCount>
            {progress.completedLessons} de {progress.totalLessons} aulas
          </LessonsCount>
          <Percentage>{progress.percentage}%</Percentage>
        </ProgressRow>

        <ProgressBar $pct={progress.percentage} />

        <Footer>
          {lastLesson ? (
            <LastLesson>Última: {lastLesson.title}</LastLesson>
          ) : (
            <span />
          )}
          <ContinueBtn href={continueHref}>
            ▶ Continuar
          </ContinueBtn>
        </Footer>
      </Body>
    </Card>
  );
}
