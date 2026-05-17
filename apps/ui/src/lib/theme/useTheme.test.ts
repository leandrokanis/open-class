import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTheme } from "./useTheme";
import { ThemeProvider } from "./ThemeProvider";
import { createElement } from "react";

describe("useTheme", () => {
  it("returns theme and toggleTheme when inside ThemeProvider", () => {
    // Arrange & Act
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) =>
        createElement(ThemeProvider, null, children),
    });

    // Assert
    expect(result.current).toHaveProperty("theme");
    expect(["light", "dark"]).toContain(result.current.theme);
    expect(typeof result.current.toggleTheme).toBe("function");
  });

  it("throws error when used outside ThemeProvider", () => {
    // Arrange & Act & Assert
    expect(() =>
      renderHook(() => useTheme())
    ).toThrow("useTheme must be used within a ThemeProvider");
  });
});
