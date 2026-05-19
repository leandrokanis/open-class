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

const StatusIcon = styled.span<{ $completed: boolean }>`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: ${({ $completed }) => ($completed ? "none" : "2px solid var(--color-border)")};
  background: ${({ $completed }) => ($completed ? "var(--color-success, #22c55e)" : "transparent")};
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
`;

const LessonTitle = styled.span<{ $completed: boolean }>`
  font-size: 14px;
  color: ${({ $completed }) => ($completed ? "var(--color-text-tertiary)" : "var(--color-text-primary)")};
  text-decoration: ${({ $completed }) => ($completed ? "line-through" : "none")};
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
  isCompleted: boolean;
}

export function LessonRow({ lesson, isCompleted }: LessonRowProps) {
  return (
    <Row>
      <StatusIcon $completed={isCompleted} aria-label={isCompleted ? "Concluída" : "Não concluída"}>
        {isCompleted ? "✓" : null}
      </StatusIcon>
      <LessonTitle $completed={isCompleted}>{lesson.title}</LessonTitle>
      {lesson.duration != null && lesson.duration > 0 && (
        <Duration>{formatDuration(lesson.duration)}</Duration>
      )}
    </Row>
  );
}
