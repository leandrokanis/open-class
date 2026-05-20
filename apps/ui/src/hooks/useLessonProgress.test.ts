import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useLessonProgress } from "./useLessonProgress";

vi.mock("@/lib/lesson-player", () => ({
  fetchLessonProgress: vi.fn(),
  toggleLessonProgress: vi.fn(),
}));

import { fetchLessonProgress, toggleLessonProgress } from "@/lib/lesson-player";
const mockFetch = vi.mocked(fetchLessonProgress);
const mockToggle = vi.mocked(toggleLessonProgress);

describe("useLessonProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads completedLessonIds and percentage from API", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      completedLessonIds: ["a", "b"],
      percentage: 40,
      completedLessons: 2,
      totalLessons: 5,
    });

    // Act
    const { result } = renderHook(() => useLessonProgress("course-1", "lesson-x"));

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.completedLessonIds).toEqual(["a", "b"]);
    expect(result.current.percentage).toBe(40);
  });

  it("isCompleted returns true when lessonId is in completedLessonIds", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      completedLessonIds: ["a", "b"],
      percentage: 40,
      completedLessons: 2,
      totalLessons: 5,
    });

    // Act
    const { result } = renderHook(() => useLessonProgress("course-1", "a"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.isCompleted("a")).toBe(true);
    expect(result.current.isCompleted("c")).toBe(false);
  });

  it("toggle marks lesson as completed optimistically", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      completedLessonIds: [],
      percentage: 0,
      completedLessons: 0,
      totalLessons: 5,
    });
    mockToggle.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLessonProgress("course-1", "lesson-x"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    await act(async () => {
      await result.current.toggle("lesson-x");
    });

    // Assert
    expect(mockToggle).toHaveBeenCalledWith("lesson-x", true);
    expect(result.current.isCompleted("lesson-x")).toBe(true);
  });

  it("toggle unmarks lesson optimistically when already completed", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      completedLessonIds: ["lesson-x"],
      percentage: 20,
      completedLessons: 1,
      totalLessons: 5,
    });
    mockToggle.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLessonProgress("course-1", "lesson-x"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    await act(async () => {
      await result.current.toggle("lesson-x");
    });

    // Assert
    expect(mockToggle).toHaveBeenCalledWith("lesson-x", false);
    expect(result.current.isCompleted("lesson-x")).toBe(false);
  });

  it("reverts optimistic update when API returns error", async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      completedLessonIds: [],
      percentage: 0,
      completedLessons: 0,
      totalLessons: 5,
    });
    mockToggle.mockRejectedValue(new Error("Server error"));

    const { result } = renderHook(() => useLessonProgress("course-1", "lesson-x"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    await act(async () => {
      await result.current.toggle("lesson-x").catch(() => {});
    });

    // Assert
    expect(result.current.isCompleted("lesson-x")).toBe(false);
  });

  it("returns empty arrays without error when API returns null (unauthenticated)", async () => {
    // Arrange
    mockFetch.mockResolvedValue(null);

    // Act
    const { result } = renderHook(() => useLessonProgress("course-1", "lesson-x"));

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.completedLessonIds).toEqual([]);
    expect(result.current.percentage).toBe(0);
  });
});
