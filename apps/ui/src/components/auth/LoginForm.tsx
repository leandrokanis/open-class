"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Link from "next/link";
import { login } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "./PasswordInput";
import { FormError } from "./FormError";
import { GoogleButton } from "./GoogleButton";
import { AuthDivider } from "./AuthDivider";

const Form = styled.form`display: flex; flex-direction: column;`;

const Heading = styled.h2`
  color: var(--color-text-primary);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 28px;
  margin: 0 0 6px;
`;

const Subtext = styled.p`
  color: var(--color-text-secondary);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 14px;
  line-height: 18px;
  margin: 0 0 28px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
`;

const ForgotRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
`;

const InlineLink = styled(Link)`
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  font-family: var(--font-inter), system-ui, sans-serif;
  &:hover { text-decoration: underline; }
`;

const SocialSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
`;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function validate() {
    let valid = true;
    if (!email.trim()) { setEmailError("Informe seu e-mail"); valid = false; } else setEmailError(null);
    if (!password) { setPasswordError("Informe sua senha"); valid = false; } else setPasswordError(null);
    return valid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) setError(result.error.message);
    else router.push("/");
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Heading>Entrar na sua conta</Heading>
      <Subtext>
        Não tem conta? <InlineLink href="/register">Cadastre-se grátis</InlineLink>
      </Subtext>

      <SocialSection>
        <GoogleButton />
        <AuthDivider />
      </SocialSection>

      <FieldGroup>
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          type="email"
          inputSize="md"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-invalid={emailError ? "true" : undefined}
          disabled={loading}
        />
        {emailError && <FormError message={emailError} />}
      </FieldGroup>

      <FieldGroup style={{ marginBottom: 0 }}>
        <Label htmlFor="login-password">Senha</Label>
        <PasswordInput
          id="login-password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          hasError={!!passwordError}
          disabled={loading}
        />
        {passwordError && <FormError message={passwordError} />}
      </FieldGroup>

      <ForgotRow>
        <InlineLink href="/forgot-password">Esqueci a senha</InlineLink>
      </ForgotRow>

      <FormError message={error} />

      <Button type="submit" size="lg" disabled={loading} style={{ width: "100%", marginBottom: 8 }}>
        {loading ? "Entrando…" : "Entrar"}
      </Button>
    </Form>
  );
}
