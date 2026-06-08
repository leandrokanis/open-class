"use client";

import { useState } from "react";
import styled from "styled-components";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FormError } from "@/components/auth/FormError";
import { changePassword } from "@/lib/profile";

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

interface PasswordFormProps {
  hasPassword: boolean;
}

export function PasswordForm({ hasPassword }: PasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (hasPassword && !currentPassword) {
      setError("Informe a senha atual.");
      return;
    }

    setLoading(true);
    const result = await changePassword({
      currentPassword: hasPassword ? currentPassword : undefined,
      newPassword,
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      {hasPassword && (
        <Field>
          <Label htmlFor="current-password">Senha atual</Label>
          <PasswordInput
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Digite sua senha atual"
            autoComplete="current-password"
          />
        </Field>
      )}

      <Field>
        <Label htmlFor="new-password">
          {hasPassword ? "Nova senha" : "Criar senha"}
        </Label>
        <PasswordInput
          id="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Mínimo de 8 caracteres"
          autoComplete="new-password"
          minLength={8}
        />
      </Field>

      <Field>
        <Label htmlFor="confirm-password">Confirmar senha</Label>
        <PasswordInput
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repita a nova senha"
          autoComplete="new-password"
        />
      </Field>

      <FormError message={error} />
      {success && (
        <p style={{ color: "var(--color-success, green)", fontSize: 14 }}>
          Senha alterada com sucesso. Um e-mail de confirmação foi enviado.
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando…" : hasPassword ? "Trocar senha" : "Criar senha"}
      </Button>
    </Form>
  );
}
