"use client";

import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePlatformConfig, uploadLogo, type PlatformConfig } from "@/lib/platform-config";

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LogoPreview = styled.div`
  width: 64px;
  height: 64px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-surface-secondary);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const Empty = styled.span`
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-align: center;
  padding: 4px;
`;

interface BrandingFormProps {
  config: PlatformConfig;
  onSaving: () => void;
  onSaved: () => void;
}

const AUTOSAVE_DELAY = 800;

export function BrandingForm({ config, onSaving, onSaved }: BrandingFormProps) {
  const [platformName, setPlatformName] = useState(config.platformName);
  const [logoUrl, setLogoUrl] = useState(config.logoUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const isDirty = useRef(false);

  // Auto-save platformName
  useEffect(() => {
    if (!isDirty.current) return;
    const timer = setTimeout(async () => {
      onSaving();
      await updatePlatformConfig({ platformName });
      onSaved();
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformName]);

  // Auto-upload logo when file selected
  useEffect(() => {
    if (!logoFile) return;
    const timer = setTimeout(async () => {
      onSaving();
      const result = await uploadLogo(logoFile);
      if (result) {
        setLogoUrl(result.logoUrl);
        setLogoFile(null);
        setPreview(null);
        onSaved();
      }
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoFile]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  const shownLogo = preview ?? logoUrl;

  return (
    <Form>
      <Field>
        <Label htmlFor="platformName">Nome da plataforma</Label>
        <Input
          id="platformName"
          value={platformName}
          onChange={(e) => {
            isDirty.current = true;
            setPlatformName(e.target.value);
          }}
          placeholder="Digite o nome da plataforma"
        />
      </Field>

      <Field>
        <Label htmlFor="logo">Logo</Label>
        <LogoRow>
          <LogoPreview>
            {shownLogo ? (
              <img src={shownLogo} alt="Pré-visualização do logo" />
            ) : (
              <Empty>Sem logo</Empty>
            )}
          </LogoPreview>
          <Input id="logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
        </LogoRow>
      </Field>
    </Form>
  );
}
