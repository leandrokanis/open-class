"use client";

import { useRef, useState } from "react";
import styled from "styled-components";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/auth/FormError";
import { uploadAvatar, deleteAvatar, type ProfileData } from "@/lib/profile";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
`;

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

interface AvatarUploaderProps {
  profile: ProfileData;
  onSaved: (updated: ProfileData) => void;
}

export function AvatarUploader({ profile, onSaved }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Formato inválido. Envie uma imagem jpg, png ou webp.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("A imagem deve ter no máximo 2 MB.");
      return;
    }

    setLoading(true);
    const result = await uploadAvatar(file);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      onSaved(result.data);
    }
  }

  async function handleDelete() {
    setError(null);
    setLoading(true);
    const result = await deleteAvatar();
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      onSaved(result.data);
    }
  }

  const initials = getInitials(profile.name);

  return (
    <Wrapper>
      <Avatar
        src={profile.avatarUrl ?? undefined}
        alt={profile.name}
        fallback={initials}
        size={96}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
        aria-label="Selecionar imagem de avatar"
      />

      <Actions>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          {loading ? "Enviando…" : profile.avatarUrl ? "Trocar avatar" : "Adicionar avatar"}
        </Button>
        {profile.avatarUrl && (
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={handleDelete}
          >
            Remover
          </Button>
        )}
      </Actions>

      <FormError message={error} />
    </Wrapper>
  );
}
