"use client";

import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updatePlatformConfig, type PlatformConfig, type UpdatePlatformConfig } from "@/lib/platform-config";

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const Group = styled.fieldset`
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Legend = styled.legend`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  padding: 0 6px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Hint = styled.span`
  font-size: 12px;
  color: var(--color-text-tertiary);
`;

interface TextsFormProps {
  config: PlatformConfig;
  onSaving: () => void;
  onSaved: () => void;
}

const AUTOSAVE_DELAY = 800;

export function TextsForm({ config, onSaving, onSaved }: TextsFormProps) {
  const [values, setValues] = useState<Required<UpdatePlatformConfig>>({
    platformName: config.platformName,
    catalogHeroEyebrow: config.catalogHeroEyebrow,
    catalogHeroHeadline: config.catalogHeroHeadline,
    catalogHeroSubtitle: config.catalogHeroSubtitle,
    loginHeroTagline: config.loginHeroTagline,
    loginHeroSubtitle: config.loginHeroSubtitle,
  });
  const isInitialMount = useRef(true);

  function set<K extends keyof UpdatePlatformConfig>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      onSaving();
      await updatePlatformConfig({
        catalogHeroEyebrow: values.catalogHeroEyebrow,
        catalogHeroHeadline: values.catalogHeroHeadline,
        catalogHeroSubtitle: values.catalogHeroSubtitle,
        loginHeroTagline: values.loginHeroTagline,
        loginHeroSubtitle: values.loginHeroSubtitle,
      });
      onSaved();
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <Form>
      <Group>
        <Legend>Página inicial (catálogo)</Legend>
        <Field>
          <Label htmlFor="catalogHeroEyebrow">Texto de apoio</Label>
          <Input
            id="catalogHeroEyebrow"
            value={values.catalogHeroEyebrow}
            onChange={(e) => set("catalogHeroEyebrow", e.target.value)}
            placeholder="Digite o texto de apoio do topo"
          />
        </Field>
        <Field>
          <Label htmlFor="catalogHeroHeadline">Chamada principal</Label>
          <Input
            id="catalogHeroHeadline"
            value={values.catalogHeroHeadline}
            onChange={(e) => set("catalogHeroHeadline", e.target.value)}
            placeholder="Digite a chamada principal"
          />
        </Field>
        <Field>
          <Label htmlFor="catalogHeroSubtitle">Subtítulo</Label>
          <Textarea
            id="catalogHeroSubtitle"
            value={values.catalogHeroSubtitle}
            onChange={(e) => set("catalogHeroSubtitle", e.target.value)}
            placeholder="Digite o subtítulo do catálogo"
            rows={3}
          />
        </Field>
      </Group>

      <Group>
        <Legend>Página de login</Legend>
        <Field>
          <Label htmlFor="loginHeroTagline">Tagline</Label>
          <Input
            id="loginHeroTagline"
            value={values.loginHeroTagline}
            onChange={(e) => set("loginHeroTagline", e.target.value)}
            placeholder="Digite a tagline do login"
          />
        </Field>
        <Field>
          <Label htmlFor="loginHeroSubtitle">Subtítulo</Label>
          <Textarea
            id="loginHeroSubtitle"
            value={values.loginHeroSubtitle}
            onChange={(e) => set("loginHeroSubtitle", e.target.value)}
            placeholder="Digite o subtítulo do login"
            rows={2}
          />
        </Field>
      </Group>

      <Hint>Campos em branco voltam a exibir o texto padrão da plataforma.</Hint>
    </Form>
  );
}
