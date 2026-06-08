"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProfile, type ProfileData } from "@/lib/profile";
import { ProfileForm } from "./ProfileForm";
import { AvatarUploader } from "./AvatarUploader";
import { PasswordForm } from "./PasswordForm";
import { useUser } from "@/hooks/useUser";

const PageWrapper = styled.div`
  max-width: 560px;
  margin: 0 auto;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
`;

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
`;

const SectionDescription = styled.p`
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin: 2px 0 0;
`;

export function ProfilePageClient() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { refetch } = useUser();

  useEffect(() => {
    getProfile().then((result) => {
      if (result.error) {
        setLoadError(result.error);
      } else if (result.data) {
        setProfile(result.data);
      }
    });
  }, []);

  function handleProfileSaved(updated: ProfileData) {
    setProfile(updated);
    refetch();
  }

  if (loadError) {
    return (
      <PageWrapper>
        <p style={{ color: "var(--color-destructive)" }}>{loadError}</p>
      </PageWrapper>
    );
  }

  if (!profile) {
    return (
      <PageWrapper>
        <p style={{ color: "var(--color-text-tertiary)" }}>Carregando…</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>Configurações de perfil</PageTitle>

      <Card>
        <CardHeader>
          <SectionTitle>Avatar</SectionTitle>
          <SectionDescription>
            Sua foto de perfil. Formatos aceitos: jpg, png, webp (máx. 2 MB).
          </SectionDescription>
        </CardHeader>
        <CardContent>
          <AvatarUploader profile={profile} onSaved={handleProfileSaved} />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <SectionTitle>Informações pessoais</SectionTitle>
          <SectionDescription>
            Seu nome e bio são visíveis para outros usuários da plataforma.
          </SectionDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} onSaved={handleProfileSaved} />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <SectionTitle>
            {profile.hasPassword ? "Trocar senha" : "Criar senha"}
          </SectionTitle>
          <SectionDescription>
            {profile.hasPassword
              ? "Para trocar a senha, informe a senha atual e a nova senha."
              : "Sua conta foi criada via Google. Você pode adicionar uma senha para entrar por e-mail também."}
          </SectionDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm hasPassword={profile.hasPassword} />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
