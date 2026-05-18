import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { useContext } from "react";
import { ThemeProvider, ThemeContext } from "./ThemeProvider";

const STORAGE_KEY = "oc-theme";

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

  it("uses dark theme when no stored preference and system is dark", async () => {
    // Arrange
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
    expect(getDataTheme()).toBe("dark");
  });

  it("uses stored localStorage preference and ignores system preference", async () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, "light");
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true, // system is dark — should be ignored
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

  it("toggleTheme switches from light to dark and updates localStorage", async () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, "light");
    let toggleFn: (() => void) | undefined;

    function ToggleTrigger() {
      const ctx = useContext(ThemeContext);
      toggleFn = ctx?.toggleTheme;
      return null;
    }

    await act(async () => {
      render(
        <ThemeProvider>
          <ToggleTrigger />
        </ThemeProvider>
      );
    });

    // Act
    await act(async () => {
      toggleFn?.();
    });

    // Assert
    expect(getDataTheme()).toBe("dark");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
  });

  it("restores persisted theme on remount", async () => {
    // Arrange — simulate user previously set dark
    localStorage.setItem(STORAGE_KEY, "dark");
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    // Act — remount
    await act(async () => {
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>
      );
    });

    // Assert
    expect(getDataTheme()).toBe("dark");
  });
});
