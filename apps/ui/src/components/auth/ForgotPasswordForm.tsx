"use client";

import { useState, type FormEvent } from "react";
import styled from "styled-components";
import { forgotPassword } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormError } from "./FormError";

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
  margin-bottom: 20px;
`;

const ConfirmBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 32px 0;
`;

const ConfirmIcon = styled.span`
  font-size: 48px;
  color: var(--color-success);
`;

const ConfirmTitle = styled.h2`
  color: var(--color-text-primary);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
`;

const ConfirmText = styled.p`
  color: var(--color-text-secondary);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 14px;
  line-height: 22px;
  margin: 0;
`;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setEmailError("Informe seu e-mail"); return; }
    setEmailError(null);
    setLoading(true);
    await forgotPassword(email);
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <ConfirmBox role="status">
        <ConfirmIcon className="material-symbols-rounded">mark_email_read</ConfirmIcon>
        <ConfirmTitle>Verifique seu e-mail</ConfirmTitle>
        <ConfirmText>
          Se o endereço <strong>{email}</strong> estiver cadastrado, você receberá um link em instantes.
        </ConfirmText>
      </ConfirmBox>
    );
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Heading>Esqueceu a senha?</Heading>
      <Subtext>Informe seu e-mail e enviaremos um link para redefinir sua senha.</Subtext>

      <FieldGroup>
        <Label htmlFor="forgot-email">E-mail</Label>
        <Input
          id="forgot-email"
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

      <FormError message={error} />

      <Button type="submit" size="lg" disabled={loading} style={{ width: "100%" }}>
        {loading ? "Enviando…" : "Enviar link"}
      </Button>
    </Form>
  );
}
