import styled from "styled-components";
import type { CourseLesson } from "@/lib/course-detail";
import { Icon } from "@/components/ui/Icon";

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

const MaskedTitle = styled.span`
  font-size: 14px;
  font-style: italic;
  color: var(--color-text-tertiary);
  flex: 1;
  line-height: 1.4;
`;

interface LessonRowProps {
  lesson: CourseLesson;
}

export function LessonRow({ lesson }: LessonRowProps) {
  const isExtra = lesson.isExtra ?? false;
  return (
    <Row
      title={isExtra ? "Conteúdo bônus — desbloqueado ao concluir as aulas do módulo" : undefined}
      style={isExtra ? { opacity: 0.7 } : undefined}
    >
      <Icon
        name={isExtra ? "lock" : "videocam"}
        size={18}
        style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }}
      />
      {isExtra ? (
        // Título e duração escondidos para preservar a surpresa da aula bônus
        <MaskedTitle>Conteúdo bônus bloqueado</MaskedTitle>
      ) : (
        <>
          <LessonTitle>{lesson.title}</LessonTitle>
          {lesson.duration != null && lesson.duration > 0 && (
            <Duration>{formatDuration(lesson.duration)}</Duration>
          )}
        </>
      )}
    </Row>
  );
}
