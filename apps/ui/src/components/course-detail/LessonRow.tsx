import styled from "styled-components";
import type { CourseLesson } from "@/lib/course-detail";

function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

const Row = styled.div`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface);
`;

const PlayIcon = styled.span`
  width: 16px;
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  font-size: 11px;
`;

const LessonTitle = styled.span`
  font-size: 14px;
  color: var(--color-text-primary);
  flex: 1;
  line-height: 1.4;
`;

const Duration = styled.span`
  font-size: 12px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
`;

interface LessonRowProps {
  lesson: CourseLesson;
  isCompleted?: boolean;
}

export function LessonRow({ lesson }: LessonRowProps) {
  return (
    <Row>
      <PlayIcon>▷</PlayIcon>
      <LessonTitle>{lesson.title}</LessonTitle>
      {lesson.duration != null && lesson.duration > 0 && (
        <Duration>{formatDuration(lesson.duration)}</Duration>
      )}
    </Row>
  );
}
