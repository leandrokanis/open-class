import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { useContext } from "react";
import { ThemeProvider, ThemeContext } from "./ThemeProvider";

// O tema global é sempre "light"; páginas dark definem data-theme por rota
// (ver ADR-014). O provider existe para compatibilidade de contexto.

function getDataTheme() {
  return document.documentElement.getAttribute("data-theme");
}

function TestConsumer() {
  const ctx = useContext(ThemeContext);
  return <div data-testid="theme">{ctx?.theme}</div>;
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("applies light theme on mount regardless of system preference", async () => {
    // Arrange — system prefers dark; provider must ignore it
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    // Act
    await act(async () => {
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );
    });

    // Assert
    expect(getDataTheme()).toBe("light");
  });

  it("exposes theme=light and a no-op toggleTheme", async () => {
    // Arrange
    let toggleFn: (() => void) | undefined;

    function ToggleTrigger() {
      const ctx = useContext(ThemeContext);
      toggleFn = ctx?.toggleTheme;
      return <div data-testid="theme">{ctx?.theme}</div>;
    }

    const { getByTestId } = render(
      <ThemeProvider>
        <ToggleTrigger />
      </ThemeProvider>
    );

    // Act — toggle não deve ter efeito
    await act(async () => {
      toggleFn?.();
    });

    // Assert
    expect(getByTestId("theme").textContent).toBe("light");
    expect(getDataTheme()).toBe("light");
  });
});
