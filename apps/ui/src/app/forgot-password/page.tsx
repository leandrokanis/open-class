"use client";

import Link from "next/link";
import styled from "styled-components";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

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

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <BackLink href="/login">
        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
          arrow_back
        </span>
        Voltar para login
      </BackLink>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
