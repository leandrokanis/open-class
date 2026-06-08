"use client";

import { useState } from "react";
import styled from "styled-components";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/auth/FormError";
import { updateProfile, type ProfileData } from "@/lib/profile";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BioWrapper = styled.div`
  position: relative;
`;

const BioCount = styled.span`
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
  color: var(--color-text-tertiary);
  pointer-events: none;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 96px;
  resize: vertical;
  padding: 13px 15px;
  padding-bottom: 28px;
  font-size: 15px;
  line-height: 1.5;
  font-family: var(--font-inter), system-ui, sans-serif;
  background-color: var(--color-surface-secondary, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--radius-input, 8px);
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-alpha, rgba(0, 0, 0, 0.08));
  }
`;

interface ProfileFormProps {
  profile: ProfileData;
  onSaved: (updated: ProfileData) => void;
}

const BIO_MAX = 300;

export function ProfileForm({ profile, onSaved }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError("O nome é obrigatório.");
      return;
    }
    if (bio.length > BIO_MAX) {
      setError(`A bio não pode ultrapassar ${BIO_MAX} caracteres.`);
      return;
    }

    setLoading(true);
    const result = await updateProfile({ name: name.trim(), bio: bio.trim() || undefined });
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      onSaved(result.data);
      setSuccess(true);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Field>
        <Label htmlFor="profile-name">Nome de exibição</Label>
        <Input
          id="profile-name"
          inputSize="md"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite seu nome de exibição"
          required
          aria-invalid={!!error && !name.trim() ? "true" : undefined}
        />
      </Field>

      <Field>
        <Label htmlFor="profile-bio">Biografia</Label>
        <BioWrapper>
          <StyledTextarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Conte um pouco sobre você (opcional)"
            maxLength={BIO_MAX + 1}
          />
          <BioCount style={{ color: bio.length > BIO_MAX ? "var(--color-destructive)" : undefined }}>
            {bio.length}/{BIO_MAX}
          </BioCount>
        </BioWrapper>
      </Field>

      <FormError message={error} />
      {success && (
        <p style={{ color: "var(--color-success, green)", fontSize: 14 }}>
          Perfil atualizado com sucesso.
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando…" : "Salvar alterações"}
      </Button>
    </Form>
  );
}
