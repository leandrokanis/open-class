import styled, { css } from "styled-components";
import { Icon } from "@/components/ui/Icon";

function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

const Row = styled.button<{ $isActive: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  border-left: 3px solid transparent;
  transition: background 0.15s;

  ${({ $isActive }) =>
    $isActive &&
    css`
      border-left-color: var(--color-primary);
      background: var(--color-surface-secondary);
    `}

  &:hover {
    background: var(--color-surface-secondary);
  }
`;

const IconSlot = styled.span`
  width: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const Title = styled.span<{ $isCompleted: boolean; $isActive: boolean }>`
  font-size: 14px;
  flex: 1;
  line-height: 1.4;
  color: ${({ $isActive }) => ($isActive ? "var(--color-primary)" : "var(--color-text-primary)")};
  text-decoration: ${({ $isCompleted }) => ($isCompleted ? "line-through" : "none")};
  color: ${({ $isCompleted, $isActive }) =>
    $isCompleted
      ? "var(--color-text-secondary)"
      : $isActive
        ? "var(--color-primary)"
        : "var(--color-text-primary)"};
`;

const Duration = styled.span`
  font-size: 12px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  width: 40px;
  text-align: right;
`;

const ExtraMark = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-primary);
  flex-shrink: 0;
`;

const MaskedTitle = styled.span`
  font-size: 14px;
  font-style: italic;
  color: var(--color-text-tertiary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface LessonRowProps {
  lesson: { id: string; title: string; durationSeconds: number | null; isExtra?: boolean };
  isCompleted: boolean;
  isActive: boolean;
  onClick: () => void;
  locked?: boolean;
}

export function LessonRow({ lesson, isCompleted, isActive, onClick, locked = false }: LessonRowProps) {
  // Extra bloqueada: esconde título e duração para preservar a surpresa (curiosidade)
  const masked = locked && (lesson.isExtra ?? false);

  const iconName = locked
    ? "lock"
    : isCompleted
      ? "check_circle"
      : isActive
        ? "play_circle"
        : "radio_button_unchecked";

  const iconColor = isCompleted && !locked
    ? "var(--color-success)"
    : isActive && !locked
      ? "var(--color-primary)"
      : "var(--color-text-tertiary)";

  return (
    <Row
      $isActive={isActive}
      onClick={locked ? undefined : onClick}
      aria-disabled={locked}
      title={masked ? "Conteúdo bônus — conclua as aulas do módulo para desbloquear" : undefined}
      style={locked ? { cursor: "not-allowed", opacity: 0.55 } : undefined}
    >
      <IconSlot>
        <Icon name={iconName} size={20} fill={!locked && (isCompleted || isActive)} style={{ color: iconColor }} />
      </IconSlot>
      {masked ? (
        <MaskedTitle>Conteúdo bônus bloqueado</MaskedTitle>
      ) : (
        <>
          <Title $isCompleted={isCompleted && !locked} $isActive={isActive && !locked}>
            {lesson.title}
          </Title>
          {lesson.isExtra && <ExtraMark>Extra</ExtraMark>}
          {lesson.durationSeconds != null && lesson.durationSeconds > 0 && (
            <Duration>{formatDuration(lesson.durationSeconds)}</Duration>
          )}
        </>
      )}
    </Row>
  );
}
