"use client";

import styled from "styled-components";
import Link from "next/link";
import type { RecentActivityItem } from "@/lib/dashboard";

const Card = styled.aside`
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 20px;
`;

const Header = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 16px;
`;

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Item = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const PlayMark = styled.div`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-surface-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 10px;
  margin-top: 1px;
`;

const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const LessonTitle = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CourseName = styled.p`
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemMeta = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const StatusBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #065f46;
  background: #d1fae5;
  padding: 2px 6px;
  border-radius: 4px;
`;

const TimeLabel = styled.span`
  font-size: 11px;
  color: var(--color-text-tertiary);
`;

const SeeAll = styled(Link)`
  display: block;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);

  &:hover {
    text-decoration: underline;
  }
`;

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (hours < 1) return "agora há pouco";
  if (hours < 24) {
    const hhmm = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `hoje, ${hhmm}`;
  }
  if (days === 1) {
    const hhmm = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `ontem, ${hhmm}`;
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface RecentActivityProps {
  items: RecentActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card>
      <Header>Atividade recente</Header>
      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>
          Nenhuma atividade ainda.
        </p>
      ) : (
        <List>
          {items.map((item) => (
            <Item key={item.lessonId}>
              <PlayMark>▶</PlayMark>
              <ItemBody>
                <LessonTitle title={item.lessonTitle}>{item.lessonTitle}</LessonTitle>
                <CourseName>{item.courseTitle}</CourseName>
              </ItemBody>
              <ItemMeta>
                {item.isCompleted && <StatusBadge>Concluída</StatusBadge>}
                <TimeLabel>{formatRelativeTime(item.updatedAt)}</TimeLabel>
              </ItemMeta>
            </Item>
          ))}
        </List>
      )}
      <SeeAll href="#">Ver histórico completo</SeeAll>
    </Card>
  );
}
