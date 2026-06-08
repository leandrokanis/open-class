"use client";

import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Icon } from "@/components/ui/Icon";
import { BrandingForm } from "@/components/admin/BrandingForm";
import { TextsForm } from "@/components/admin/TextsForm";
import type { PlatformConfig } from "@/lib/platform-config";

const PageWrapper = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const SaveIndicator = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
  padding-top: 6px;
  animation: ${fadeIn} 0.2s ease;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
`;

interface AdminConfigPageClientProps {
  config: PlatformConfig;
}

export function AdminConfigPageClient({ config }: AdminConfigPageClientProps) {
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  function handleSaving() {
    setSaving(true);
  }

  function handleSaved() {
    setSavedAt(new Date());
    setSaving(false);
  }

  const savedTime = savedAt
    ? savedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <PageWrapper>
      <Header>
        <HeaderText>
          <Title>Configurações da plataforma</Title>
          <Subtitle>Personalize a identidade e os textos exibidos para os visitantes.</Subtitle>
        </HeaderText>

        {saving && (
          <SaveIndicator key="saving">
            <Icon name="sync" size={13} />
            Salvando...
          </SaveIndicator>
        )}
        {!saving && savedTime && (
          <SaveIndicator key={savedTime}>
            <Icon name="check_circle" size={13} style={{ color: "var(--color-success, #22c55e)" }} />
            Salvo às {savedTime}
          </SaveIndicator>
        )}
      </Header>

      <Section>
        <SectionTitle>Identidade</SectionTitle>
        <BrandingForm config={config} onSaving={handleSaving} onSaved={handleSaved} />
      </Section>

      <Section>
        <SectionTitle>Textos</SectionTitle>
        <TextsForm config={config} onSaving={handleSaving} onSaved={handleSaved} />
      </Section>
    </PageWrapper>
  );
}
