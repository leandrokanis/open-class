import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RegisterForm } from "./RegisterForm";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock("@/lib/auth", () => ({
  register: vi.fn(),
  loginWithGoogle: vi.fn(),
}));
vi.mock("./GoogleButton", () => ({ GoogleButton: () => <button type="button">Google</button> }));
vi.mock("./AuthDivider", () => ({ AuthDivider: () => <hr /> }));

import { register } from "@/lib/auth";
const mockRegister = vi.mocked(register);

function fillAndSubmit(name = "Maria Silva", email = "maria@test.com", password = "senha123") {
  fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));
}

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<RegisterForm />);
  });

  it("redirects to / after successful registration", async () => {
    // Arrange
    mockRegister.mockResolvedValue({ data: {} });

    // Act
    fillAndSubmit();

    // Assert
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith("Maria Silva", "maria@test.com", "senha123");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error when email is already registered (API 409)", async () => {
    // Arrange
    mockRegister.mockResolvedValue({
      error: { status: 409, message: "Este e-mail já está cadastrado" },
    });

    // Act
    fillAndSubmit();

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Este e-mail já está cadastrado");
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows validation error when password is shorter than 8 characters", async () => {
    // Arrange / Act
    fillAndSubmit("Maria Silva", "maria@test.com", "abc");

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Mínimo 8 caracteres")).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("disables submit button while loading", async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolve: (v: any) => void;
    mockRegister.mockReturnValue(new Promise((r) => (resolve = r)));

    // Act
    fillAndSubmit();

    // Assert
    const btn = screen.getByRole("button", { name: /criando conta/i });
    expect(btn).toBeDisabled();

    // Cleanup
    resolve!({ data: {} });
    await waitFor(() => expect(mockPush).toHaveBeenCalled());
  });
});
