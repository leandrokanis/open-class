"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchLessonProgress, toggleLessonProgress } from "@/lib/lesson-player";

interface LessonProgressState {
  completedLessonIds: string[];
  percentage: number;
  isLoading: boolean;
}

export function useLessonProgress(courseId: string, _lessonId: string) {
  const [state, setState] = useState<LessonProgressState>({
    completedLessonIds: [],
    percentage: 0,
    isLoading: true,
  });

  useEffect(() => {
    fetchLessonProgress(courseId).then((data) => {
      setState({
        completedLessonIds: data?.completedLessonIds ?? [],
        percentage: data?.percentage ?? 0,
        isLoading: false,
      });
    });
  }, [courseId]);

  const isCompleted = useCallback(
    (id: string) => state.completedLessonIds.includes(id),
    [state.completedLessonIds],
  );

  const toggle = useCallback(
    async (lessonId: string) => {
      const wasCompleted = state.completedLessonIds.includes(lessonId);
      const next = wasCompleted
        ? state.completedLessonIds.filter((id) => id !== lessonId)
        : [...state.completedLessonIds, lessonId];

      setState((prev) => ({ ...prev, completedLessonIds: next }));

      try {
        await toggleLessonProgress(lessonId, !wasCompleted);
      } catch (err) {
        setState((prev) => ({ ...prev, completedLessonIds: state.completedLessonIds }));
        throw err;
      }
    },
    [state.completedLessonIds],
  );

  return {
    completedLessonIds: state.completedLessonIds,
    percentage: state.percentage,
    isLoading: state.isLoading,
    isCompleted,
    toggle,
  };
}
