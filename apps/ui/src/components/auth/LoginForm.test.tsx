import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./LoginForm";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock("@/lib/auth", () => ({
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
}));
vi.mock("./GoogleButton", () => ({ GoogleButton: () => <button type="button">Google</button> }));
vi.mock("./AuthDivider", () => ({ AuthDivider: () => <hr /> }));

import { login } from "@/lib/auth";
const mockLogin = vi.mocked(login);

function fillAndSubmit(email = "user@test.com", password = "senha123") {
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: /entrar/i }));
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<LoginForm />);
  });

  it("redirects to / after successful login", async () => {
    // Arrange
    mockLogin.mockResolvedValue({ data: {} });

    // Act
    fillAndSubmit();

    // Assert
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("user@test.com", "senha123");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error message when API returns 401", async () => {
    // Arrange
    mockLogin.mockResolvedValue({ error: { status: 401, message: "E-mail ou senha incorretos" } });

    // Act
    fillAndSubmit();

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("E-mail ou senha incorretos");
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows disabled account error when API returns 403", async () => {
    // Arrange
    mockLogin.mockResolvedValue({
      error: { status: 403, message: "Conta desativada. Entre em contato com o suporte" },
    });

    // Act
    fillAndSubmit();

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Conta desativada");
    });
  });

  it("does not call API when email is empty", async () => {
    // Arrange / Act
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha123" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    // Assert
    expect(mockLogin).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("Informe seu e-mail")).toBeInTheDocument();
    });
  });

  it("does not call API when password is empty", async () => {
    // Arrange / Act
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "user@test.com" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    // Assert
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("disables submit button while loading", async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolve: (v: any) => void;
    mockLogin.mockReturnValue(new Promise((r) => (resolve = r)));

    // Act
    fillAndSubmit();

    // Assert
    const btn = screen.getByRole("button", { name: /entrando/i });
    expect(btn).toBeDisabled();

    // Cleanup
    resolve!({ data: {} });
    await waitFor(() => expect(mockPush).toHaveBeenCalled());
  });
});
