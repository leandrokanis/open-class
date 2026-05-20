"use client";

import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { MarkCompleteButton } from "./MarkCompleteButton";
import { UserAvatarMenu } from "@/components/ui/UserAvatarMenu";

const Bar = styled.header`
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 24px;
    height: 56px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 50;
  }
`;


const LessonInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const LessonTitle = styled.h1`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LessonBreadcrumb = styled.p`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const RightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
`;

interface PlayerNavbarProps {
  courseTitle: string;
  courseSlug: string;
  lessonTitle: string;
  lessonIndex: number;
  totalLessons: number;
  isCompleted: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

export function PlayerNavbar({
  courseTitle,
  courseSlug,
  lessonTitle,
  lessonIndex,
  totalLessons,
  isCompleted,
  isLoading,
  onToggle,
}: PlayerNavbarProps) {
  return (
    <Bar>
      <Button variant="ghost" size="sm" asChild style={{ flexShrink: 0, color: "var(--color-text-primary)" }}>
        <Link href="/aprendizado" aria-label="Voltar">
          <Icon name="arrow_back" size={18} style={{ color: "var(--color-text-primary)" }} />
        </Link>
      </Button>

      <LessonInfo>
        <LessonTitle>{lessonTitle}</LessonTitle>
        <LessonBreadcrumb>
          {courseTitle} · Aula {lessonIndex} de {totalLessons}
        </LessonBreadcrumb>
      </LessonInfo>

      <RightArea>
        <MarkCompleteButton
          isCompleted={isCompleted}
          isLoading={isLoading}
          onToggle={onToggle}
          inline
        />
        <UserAvatarMenu />
      </RightArea>
    </Bar>
  );
}
