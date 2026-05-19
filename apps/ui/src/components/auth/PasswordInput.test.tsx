import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasswordInput } from "./PasswordInput";

describe("PasswordInput", () => {
  it("renders as type password by default", () => {
    // Arrange / Act
    render(<PasswordInput placeholder="senha" />);
    const input = screen.getByPlaceholderText("senha");

    // Assert
    expect(input).toHaveAttribute("type", "password");
  });

  it("shows password text when toggle button is clicked", () => {
    // Arrange
    render(<PasswordInput placeholder="senha" />);
    const input = screen.getByPlaceholderText("senha");
    const toggle = screen.getByRole("button", { name: /mostrar senha/i });

    // Act
    fireEvent.click(toggle);

    // Assert
    expect(input).toHaveAttribute("type", "text");
  });

  it("hides password again when toggle is clicked twice", () => {
    // Arrange
    render(<PasswordInput placeholder="senha" />);
    const input = screen.getByPlaceholderText("senha");
    const toggle = screen.getByRole("button", { name: /mostrar senha/i });

    // Act
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole("button", { name: /ocultar senha/i }));

    // Assert
    expect(input).toHaveAttribute("type", "password");
  });

  it("applies aria-invalid when hasError is true", () => {
    // Arrange / Act
    render(<PasswordInput placeholder="senha" hasError />);
    const input = screen.getByPlaceholderText("senha");

    // Assert
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
