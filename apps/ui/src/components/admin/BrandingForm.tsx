"use client";

import { useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePlatformConfig, uploadLogo, type PlatformConfig } from "@/lib/platform-config";

const Form = styled.form`
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

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

interface BrandingFormProps {
  config: PlatformConfig;
}

export function BrandingForm({ config }: BrandingFormProps) {
  const [platformName, setPlatformName] = useState(config.platformName);
  const [logoUrl, setLogoUrl] = useState(config.logoUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (logoFile) {
        const result = await uploadLogo(logoFile);
        if (!result) {
          toast.error("Falha no upload do logo. Verifique o formato (jpg, png, webp) e o tamanho (máx 2MB).");
          return;
        }
        setLogoUrl(result.logoUrl);
        setLogoFile(null);
        setPreview(null);
      }
      const result = await updatePlatformConfig({ platformName });
      if (!result) {
        toast.error("Falha ao salvar o nome da plataforma.");
        return;
      }
      toast.success("Identidade da plataforma salva.");
    } catch {
      toast.error("Erro inesperado ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const shownLogo = preview ?? logoUrl;

  return (
    <Form onSubmit={handleSubmit}>
      <Field>
        <Label htmlFor="platformName">Nome da plataforma</Label>
        <Input
          id="platformName"
          value={platformName}
          onChange={(e) => setPlatformName(e.target.value)}
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

      <Actions>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar identidade"}
        </Button>
      </Actions>
    </Form>
  );
}
