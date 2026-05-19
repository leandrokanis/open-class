import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResetPasswordForm } from "./ResetPasswordForm";

vi.mock("@/lib/auth", () => ({ resetPassword: vi.fn() }));

import { resetPassword } from "@/lib/auth";
const mockResetPassword = vi.mocked(resetPassword);

const onSuccess = vi.fn();

function fillAndSubmit(password = "novaSenha123", confirm = "novaSenha123") {
  fireEvent.change(screen.getByLabelText("Nova senha"), { target: { value: password } });
  fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: confirm } });
  fireEvent.click(screen.getByRole("button", { name: /redefinir senha/i }));
}

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<ResetPasswordForm token="valid-token" onSuccess={onSuccess} />);
  });

  it("calls onSuccess after successful reset", async () => {
    // Arrange
    mockResetPassword.mockResolvedValue({ data: {} });

    // Act
    fillAndSubmit();

    // Assert
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith("valid-token", "novaSenha123");
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows error when passwords do not match", () => {
    // Arrange / Act
    fillAndSubmit("novaSenha123", "diferente456");

    // Assert
    expect(mockResetPassword).not.toHaveBeenCalled();
    expect(screen.getByText("As senhas não coincidem")).toBeInTheDocument();
  });

  it("shows error when password is shorter than 8 characters", () => {
    // Arrange / Act
    fillAndSubmit("abc", "abc");

    // Assert
    expect(mockResetPassword).not.toHaveBeenCalled();
    expect(screen.getByText("Mínimo 8 caracteres")).toBeInTheDocument();
  });

  it("shows inline error when token is invalid or expired (API 400)", async () => {
    // Arrange
    mockResetPassword.mockResolvedValue({
      error: { status: 400, message: "Link inválido ou expirado. Solicite um novo." },
    });

    // Act
    fillAndSubmit();

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Link inválido ou expirado");
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("disables submit button while loading", async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolve: (v: any) => void;
    mockResetPassword.mockReturnValue(new Promise((r) => (resolve = r)));

    // Act
    fillAndSubmit();

    // Assert
    expect(screen.getByRole("button", { name: /redefinindo/i })).toBeDisabled();

    // Cleanup
    resolve!({ data: {} });
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });
});
