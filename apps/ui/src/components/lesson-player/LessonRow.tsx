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

interface LessonRowProps {
  lesson: { id: string; title: string; durationSeconds: number | null };
  isCompleted: boolean;
  isActive: boolean;
  onClick: () => void;
}

export function LessonRow({ lesson, isCompleted, isActive, onClick }: LessonRowProps) {
  const iconName = isCompleted
    ? "check_circle"
    : isActive
      ? "play_circle"
      : "radio_button_unchecked";

  const iconColor = isCompleted
    ? "var(--color-success)"
    : isActive
      ? "var(--color-primary)"
      : "var(--color-text-tertiary)";

  return (
    <Row $isActive={isActive} onClick={onClick}>
      <IconSlot>
        <Icon name={iconName} size={20} fill={isCompleted || isActive} style={{ color: iconColor }} />
      </IconSlot>
      <Title $isCompleted={isCompleted} $isActive={isActive}>
        {lesson.title}
      </Title>
      {lesson.durationSeconds != null && lesson.durationSeconds > 0 && (
        <Duration>{formatDuration(lesson.durationSeconds)}</Duration>
      )}
    </Row>
  );
}
