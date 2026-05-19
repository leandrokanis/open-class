"use client";

import styled from "styled-components";
import { AuthHero } from "./AuthHero";
import type { ReactNode } from "react";

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const FormZone = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #ffffff;
  padding: 32px 24px 40px;

  /* Auth form is always light — override dark-mode token inheritance */
  [data-theme="dark"] & {
    --color-surface-secondary: #f9fafb;
    --color-surface-tertiary: #f3f4f6;
    --color-text-primary: #111827;
    --color-text-secondary: #6b7280;
    --color-text-tertiary: #9ca3af;
    --color-border: #e5e7eb;
    --color-primary: #1e3a8a;
    --color-primary-light: #eff6ff;
    --color-destructive: #ef4444;
  }

  @media (min-width: 768px) {
    justify-content: center;
    align-items: center;
    padding: 48px 64px;
  }
`;

const FormInner = styled.div`
  width: 100%;

  @media (min-width: 768px) {
    max-width: 440px;
  }
`;

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Page>
      <AuthHero />
      <FormZone>
        <FormInner>{children}</FormInner>
      </FormZone>
    </Page>
  );
}
