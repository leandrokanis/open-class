"use client";

import { useState, type FormEvent } from "react";
import styled from "styled-components";
import { resetPassword } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "./PasswordInput";
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
  margin-bottom: 14px;
`;

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    let valid = true;
    if (password.length < 8) { setPasswordError("Mínimo 8 caracteres"); valid = false; } else setPasswordError(null);
    if (password !== confirm) { setConfirmError("As senhas não coincidem"); valid = false; } else setConfirmError(null);
    return valid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);
    if (result.error) setError(result.error.message);
    else onSuccess();
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Heading>Redefinir senha</Heading>
      <Subtext>Escolha uma nova senha com pelo menos 8 caracteres.</Subtext>

      <FieldGroup>
        <Label htmlFor="reset-password">Nova senha</Label>
        <PasswordInput
          id="reset-password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          hasError={!!passwordError}
          disabled={loading}
        />
        {passwordError && <FormError message={passwordError} />}
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="reset-confirm">Confirmar senha</Label>
        <PasswordInput
          id="reset-confirm"
          placeholder="Repita a nova senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          hasError={!!confirmError}
          disabled={loading}
        />
        {confirmError && <FormError message={confirmError} />}
      </FieldGroup>

      <FormError message={error} />

      <Button type="submit" size="lg" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
        {loading ? "Redefinindo…" : "Redefinir senha"}
      </Button>
    </Form>
  );
}
