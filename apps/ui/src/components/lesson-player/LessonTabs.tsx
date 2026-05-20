"use client";

import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import styled from "styled-components";
import { Icon } from "@/components/ui/Icon";

const Root = styled(TabsPrimitive.Root)`
  display: flex;
  flex-direction: column;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const List = styled(TabsPrimitive.List)`
  display: flex;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
`;

const Trigger = styled(TabsPrimitive.Trigger)`
  flex: 1;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s, border-color 0.15s;

  &[data-state="active"] {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
  }
`;

const Content = styled(TabsPrimitive.Content)`
  flex: 1;
  outline: none;
`;

const DescriptionWrap = styled.div`
  padding: 20px;
`;

const DescriptionText = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.7;
`;

const ResourcesWrap = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ResourceLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const EmptyState = styled.p`
  font-size: 14px;
  color: var(--color-text-tertiary);
  padding: 20px;
`;

interface Resource {
  id: string;
  label: string;
  url: string;
}

interface LessonTabsProps {
  curriculum: React.ReactNode;
  description: string | null;
  resources: Resource[];
}

export function LessonTabs({ curriculum, description, resources }: LessonTabsProps) {
  return (
    <Root defaultValue="curriculum">
      <List aria-label="Conteúdo da aula">
        <Trigger value="curriculum">Currículo</Trigger>
        <Trigger value="description">Descrição</Trigger>
        <Trigger value="resources">Recursos</Trigger>
      </List>

      <Content value="curriculum">{curriculum}</Content>

      <Content value="description">
        <DescriptionWrap>
          {description ? (
            <DescriptionText>{description}</DescriptionText>
          ) : (
            <EmptyState>Nenhuma descrição disponível.</EmptyState>
          )}
        </DescriptionWrap>
      </Content>

      <Content value="resources">
        <ResourcesWrap>
          {resources.length > 0 ? (
            resources.map((r) => (
              <ResourceLink key={r.id} href={r.url} target="_blank" rel="noopener noreferrer">
                <Icon name="link" size={16} style={{ flexShrink: 0 }} />
                {r.label}
              </ResourceLink>
            ))
          ) : (
            <EmptyState>Nenhum recurso disponível para esta aula.</EmptyState>
          )}
        </ResourcesWrap>
      </Content>
    </Root>
  );
}
