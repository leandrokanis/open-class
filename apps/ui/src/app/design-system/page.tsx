"use client";

import styled from "styled-components";
import { useState } from "react";
import { useTheme } from "@/lib/theme/useTheme";
import { tokens } from "@/lib/theme/tokens";
import {
  Button,
  Input,
  Badge,
  Avatar,
  Separator,
  Skeleton,
  Card,
  CardHeader,
  CardContent,
  Dialog,
} from "@/components/ui";
import {
  Display,
  H1,
  H2,
  H3,
  BodyLg,
  Body,
  NavLink,
  Overline,
  Caption,
  BadgeDark,
  BadgeLight,
  Chip,
  CardTitle,
} from "@/styles/typography";

const Page = styled.div`
  min-height: 100vh;
  background-color: var(--color-background);
  padding: 40px 80px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
`;

const Section = styled.section`
  margin-bottom: 48px;
`;

const SectionTitle = styled.h2`
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
`;

const Grid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols ?? 4}, 1fr);
  gap: 12px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const Swatch = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SwatchColor = styled.div<{ $bg: string }>`
  width: 100%;
  height: 64px;
  border-radius: 8px;
  background: ${({ $bg }) => $bg};
  border: 1px solid var(--color-border);
`;

const SwatchLabel = styled.span`
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 11px;
  color: var(--color-text-secondary);
`;

const colorSwatches = [
  { label: "--color-primary", value: "var(--color-primary)" },
  { label: "--color-primary-light", value: "var(--color-primary-light)" },
  { label: "--color-background", value: "var(--color-background)" },
  { label: "--color-surface", value: "var(--color-surface)" },
  { label: "--color-surface-secondary", value: "var(--color-surface-secondary)" },
  { label: "--color-surface-tertiary", value: "var(--color-surface-tertiary)" },
  { label: "--color-border", value: "var(--color-border)" },
  { label: "--color-text-primary", value: "var(--color-text-primary)" },
  { label: "--color-text-secondary", value: "var(--color-text-secondary)" },
  { label: "--color-text-tertiary", value: "var(--color-text-tertiary)" },
  { label: "--color-star", value: "var(--color-star)" },
  { label: "--color-success", value: "var(--color-success)" },
  { label: "--color-destructive", value: "var(--color-destructive)" },
];

export default function DesignSystemPage() {
  const { theme, toggleTheme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Page>
      <Header>
        <H2 style={{ margin: 0 }}>Open Class — Design System</H2>
        <Button variant="secondary" size="sm" onClick={toggleTheme}>
          Tema: {theme === "light" ? "☀️ Light" : "🌙 Dark"}
        </Button>
      </Header>

      {/* Color Tokens */}
      <Section>
        <SectionTitle>Cores</SectionTitle>
        <Grid $cols={5}>
          {colorSwatches.map((s) => (
            <Swatch key={s.label} $color={s.value}>
              <SwatchColor $bg={s.value} />
              <SwatchLabel>{s.label}</SwatchLabel>
            </Swatch>
          ))}
        </Grid>
      </Section>

      <Separator />

      {/* Gradients */}
      <Section style={{ marginTop: 48 }}>
        <SectionTitle>Gradientes</SectionTitle>
        <Row>
          {[
            { label: "--gradient-hero", value: "var(--gradient-hero)" },
            { label: "--gradient-avatar", value: "var(--gradient-avatar)" },
            { label: "--gradient-card-devweb", value: "var(--gradient-card-devweb)" },
          ].map((g) => (
            <div key={g.label}>
              <SwatchColor $bg={g.value} style={{ width: 200 }} />
              <SwatchLabel>{g.label}</SwatchLabel>
            </div>
          ))}
        </Row>
      </Section>

      <Separator />

      {/* Typography */}
      <Section style={{ marginTop: 48 }}>
        <SectionTitle>Tipografia — Inter</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Display>Display — 44px / 900</Display>
          <H1>H1 — 36px / 800</H1>
          <H2>H2 — 28px / 700</H2>
          <H3>H3 — 22px / 700</H3>
          <BodyLg>BodyLg — 16px / 400 — Texto corrido de parágrafo maior</BodyLg>
          <Body>Body — 14px / 400 — Texto padrão de interface</Body>
          <NavLink>NavLink — 14px / 500</NavLink>
          <Overline>Overline — 13px / 600 / uppercase</Overline>
          <Caption>Caption — 12px / 400</Caption>
          <Row>
            <BadgeDark style={{ background: "var(--color-primary)", padding: "2px 8px", borderRadius: 4 }}>BadgeDark</BadgeDark>
            <BadgeLight>BadgeLight — 11px</BadgeLight>
            <Chip style={{ background: "var(--color-overlay-subtle)", padding: "2px 8px", borderRadius: 4 }}>Chip</Chip>
          </Row>
        </div>
      </Section>

      <Separator />

      {/* Buttons */}
      <Section style={{ marginTop: 48 }}>
        <SectionTitle>Button</SectionTitle>
        <Row>
          <Button>Default (md)</Button>
          <Button size="sm">Default (sm)</Button>
          <Button size="lg">Default (lg)</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
        </Row>
      </Section>

      <Separator />

      {/* Input */}
      <Section style={{ marginTop: 48 }}>
        <SectionTitle>Input</SectionTitle>
        <div style={{ maxWidth: 400, display: "flex", flexDirection: "column", gap: 12 }}>
          <Input placeholder="Buscar cursos..." />
          <Input placeholder="Desabilitado" disabled />
        </div>
      </Section>

      <Separator />

      {/* Badges */}
      <Section style={{ marginTop: 48 }}>
        <SectionTitle>Badge</SectionTitle>
        <Row>
          <Badge variant="default">Dev Web</Badge>
          <Badge variant="light">Intermediário</Badge>
          <Badge variant="overlay">Design</Badge>
        </Row>
      </Section>

      <Separator />

      {/* Avatar */}
      <Section style={{ marginTop: 48 }}>
        <SectionTitle>Avatar</SectionTitle>
        <Row>
          <Avatar fallback="C" size={40} />
          <Avatar fallback="AB" size={56} />
          <Avatar fallback="LM" size={32} />
        </Row>
      </Section>

      <Separator />

      {/* Skeleton */}
      <Section style={{ marginTop: 48 }}>
        <SectionTitle>Skeleton</SectionTitle>
        <div style={{ maxWidth: 320, display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton height="156px" />
          <Skeleton height="16px" width="70%" />
          <Skeleton height="12px" width="50%" />
        </div>
      </Section>

      <Separator />

      {/* Card */}
      <Section style={{ marginTop: 48 }}>
        <SectionTitle>Card</SectionTitle>
        <div style={{ maxWidth: 296 }}>
          <Card>
            <Skeleton height="156px" style={{ borderRadius: 0 }} />
            <CardHeader>
              <CardTitle>JavaScript do Zero ao Avançado</CardTitle>
              <Caption>por Carlos Mendes</Caption>
            </CardHeader>
            <CardContent>
              <Body style={{ color: "var(--color-text-secondary)" }}>48 aulas</Body>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Separator />

      {/* Dialog */}
      <Section style={{ marginTop: 48 }}>
        <SectionTitle>Dialog</SectionTitle>
        <Button onClick={() => setDialogOpen(true)}>Abrir Dialog</Button>
        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Confirmar ação"
          description="Esta ação não pode ser desfeita. Tem certeza que deseja continuar?"
        >
          <Row style={{ justifyContent: "flex-end", marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => setDialogOpen(false)}>Confirmar</Button>
          </Row>
        </Dialog>
      </Section>
    </Page>
  );
}
