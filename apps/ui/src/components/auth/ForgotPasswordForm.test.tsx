import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

vi.mock("@/lib/auth", () => ({ forgotPassword: vi.fn() }));

import { forgotPassword } from "@/lib/auth";
const mockForgotPassword = vi.mocked(forgotPassword);

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<ForgotPasswordForm />);
  });

  it("shows confirmation view after successful submission", async () => {
    // Arrange
    mockForgotPassword.mockResolvedValue({ data: {} });
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "user@test.com" },
    });

    // Act
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText(/verifique seu e-mail/i)).toBeInTheDocument();
    });
  });

  it("shows confirmation even when email does not exist (generic response)", async () => {
    // Arrange
    mockForgotPassword.mockResolvedValue({ error: { status: 200, message: "ok" } });
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "inexistente@test.com" },
    });

    // Act
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));

    // Assert — always shows confirmation regardless of API result
    await waitFor(() => {
      expect(screen.getByText(/verifique seu e-mail/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when email field is empty", async () => {
    // Arrange / Act
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));

    // Assert
    expect(mockForgotPassword).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("Informe seu e-mail")).toBeInTheDocument();
    });
  });

  it("disables submit button while loading", async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolve: (v: any) => void;
    mockForgotPassword.mockReturnValue(new Promise((r) => (resolve = r)));
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "user@test.com" },
    });

    // Act
    fireEvent.click(screen.getByRole("button", { name: /enviar link/i }));

    // Assert
    expect(screen.getByRole("button", { name: /enviando/i })).toBeDisabled();

    // Cleanup
    resolve!({ data: {} });
    await waitFor(() => expect(screen.getByText(/verifique seu e-mail/i)).toBeInTheDocument());
  });
});
