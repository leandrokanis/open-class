"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import styled, { keyframes } from "styled-components";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/Icon";

const EditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-background);
`;

const TopBar = styled.div`
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
`;

const Tabs = styled.div`
  display: flex;
`;

const TabLink = styled(Link)<{ $active: boolean }>`
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text-secondary)")};
  text-decoration: none;
  border-bottom: 2px solid ${({ $active }) => ($active ? "var(--color-primary)" : "transparent")};
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: var(--color-text-primary);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(2px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const SavedIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
  animation: ${fadeIn} 0.2s ease;
`;

const Content = styled.div`
  flex: 1;
`;

export const CourseEditorContext = React.createContext<{
  courseId: string;
  slug: string;
  setSlug: (slug: string) => void;
  notifySaved: () => void;
} | null>(null);

interface CourseEditorLayoutProps {
  children: React.ReactNode;
}

export default function CourseEditorLayout({ children }: CourseEditorLayoutProps) {
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const courseId = params.id;

  const [slug, setSlugState] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const basePath = `/instructor/cursos/${courseId}`;

  const tabs = [
    { label: "Curso", href: basePath },
    { label: "Aulas", href: `${basePath}/aulas` },
    { label: "Configurações", href: `${basePath}/configuracoes` },
    { label: "Alunos", href: `${basePath}/alunos` },
  ];

  const setSlug = useCallback((s: string) => setSlugState(s), []);
  const notifySaved = useCallback(() => setSavedAt(new Date()), []);

  const savedTime = savedAt
    ? savedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <CourseEditorContext.Provider value={{ courseId, slug, setSlug, notifySaved }}>
      <EditorWrapper>
        <TopBar>
          <Tabs>
            {tabs.map((tab) => (
              <TabLink key={tab.href} href={tab.href} $active={pathname === tab.href}>
                {tab.label}
              </TabLink>
            ))}
          </Tabs>
          <ActionButtons>
            {savedTime && (
              <SavedIndicator key={savedTime}>
                <Icon name="check_circle" size={15} style={{ color: "var(--color-success)" }} />
                Salvo às {savedTime}
              </SavedIndicator>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(slug ? `/curso/${slug}` : "#", "_blank")}
              disabled={!slug}
            >
              <Icon name="open_in_new" size={15} />
              Pré-visualizar
            </Button>
          </ActionButtons>
        </TopBar>
        <Content>{children}</Content>
      </EditorWrapper>
    </CourseEditorContext.Provider>
  );
}
