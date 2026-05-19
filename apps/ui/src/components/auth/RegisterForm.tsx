"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Link from "next/link";
import { register } from "@/lib/auth";
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

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  function validate() {
    let valid = true;
    if (name.trim().length < 2) { setNameError("Informe seu nome completo"); valid = false; } else setNameError(null);
    if (!email.trim()) { setEmailError("Informe seu e-mail"); valid = false; } else setEmailError(null);
    if (password.length < 8) { setPasswordError("Mínimo 8 caracteres"); valid = false; } else setPasswordError(null);
    return valid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    const result = await register(name.trim(), email, password);
    setLoading(false);
    if (result.error) setError(result.error.message);
    else router.push("/");
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Heading>Criar sua conta</Heading>
      <Subtext>
        Já tem conta? <InlineLink href="/login">Entrar</InlineLink>
      </Subtext>

      <SocialSection>
        <GoogleButton label="Registrar com Google" />
        <AuthDivider label="ou registre com e-mail" />
      </SocialSection>

      <FieldGroup>
        <Label htmlFor="reg-name">Nome completo</Label>
        <Input
          id="reg-name"
          type="text"
          inputSize="md"
          placeholder="Maria Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          aria-invalid={nameError ? "true" : undefined}
          disabled={loading}
        />
        {nameError && <FormError message={nameError} />}
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="reg-email">E-mail</Label>
        <Input
          id="reg-email"
          type="email"
          inputSize="md"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-invalid={emailError ? "true" : undefined}
          disabled={loading}
        />
        {emailError && <FormError message={emailError} />}
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="reg-password">Senha</Label>
        <PasswordInput
          id="reg-password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          hasError={!!passwordError}
          disabled={loading}
        />
        {passwordError && <FormError message={passwordError} />}
      </FieldGroup>

      <FormError message={error} />

      <Button type="submit" size="lg" disabled={loading} style={{ width: "100%", marginTop: 8, marginBottom: 8 }}>
        {loading ? "Criando conta…" : "Criar conta"}
      </Button>
    </Form>
  );
}
