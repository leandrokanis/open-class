"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2563eb;
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 24px;

  &:hover {
    text-decoration: underline;
  }
`;

const SuccessBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 32px 0;
`;

const SuccessIcon = styled.span`
  font-size: 48px;
  color: #22c55e;
`;

const SuccessTitle = styled.h2`
  color: #0f172a;
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
`;

const SuccessText = styled.p`
  color: #64748b;
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 14px;
  line-height: 22px;
  margin: 0;
`;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.replace("/forgot-password");
    }
  }, [token, router]);

  if (!token) return null;

  if (success) {
    return (
      <SuccessBox role="status">
        <SuccessIcon className="material-symbols-rounded">check_circle</SuccessIcon>
        <SuccessTitle>Senha redefinida!</SuccessTitle>
        <SuccessText>
          Sua senha foi atualizada com sucesso. Você já pode entrar com a nova
          senha.
        </SuccessText>
        <BackLink href="/login">Ir para o login</BackLink>
      </SuccessBox>
    );
  }

  return (
    <>
      <BackLink href="/login">
        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
          arrow_back
        </span>
        Voltar para login
      </BackLink>
      <ResetPasswordForm token={token} onSuccess={() => setSuccess(true)} />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
