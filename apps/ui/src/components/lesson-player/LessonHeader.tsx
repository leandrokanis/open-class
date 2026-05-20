import Link from "next/link";
import styled from "styled-components";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/Icon";
import { MarkCompleteButton } from "./MarkCompleteButton";

const Header = styled.div`
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
  flex: 1;
`;

const ModuleLabel = styled.p`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const LessonMeta = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

interface LessonHeaderProps {
  title: string;
  moduleTitle: string;
  lessonIndex: number;
  totalLessons: number;
  durationSeconds: number | null;
  isCompleted: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

export function LessonHeader({
  title,
  moduleTitle,
  lessonIndex,
  totalLessons,
  durationSeconds,
  isCompleted,
  isLoading,
  onToggle,
}: LessonHeaderProps) {
  const durationStr = durationSeconds ? ` · ${formatDuration(durationSeconds)}` : "";
  return (
    <Header>
      <TitleRow>
        <Button variant="ghost" size="sm" asChild style={{ flexShrink: 0, padding: "4px 6px", color: "var(--color-text-primary)" }}>
          <Link href="/aprendizado" aria-label="Voltar">
            <Icon name="arrow_back" size={18} style={{ color: "var(--color-text-primary)" }} />
          </Link>
        </Button>
        <Title>{title}</Title>
      </TitleRow>
      <ModuleLabel>{moduleTitle}</ModuleLabel>
      <BottomRow>
        <LessonMeta>Aula {lessonIndex} de {totalLessons}{durationStr}</LessonMeta>
        <MarkCompleteButton isCompleted={isCompleted} isLoading={isLoading} onToggle={onToggle} inline />
      </BottomRow>
    </Header>
  );
}
