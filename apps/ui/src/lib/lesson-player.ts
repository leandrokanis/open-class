const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

const CLIENT_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface LessonResource {
  id: string;
  label: string;
  url: string;
}

export interface LessonDetail {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  youtubeVideoId: string | null;
  durationSeconds: number | null;
  position: number;
  isVisible: boolean;
  resources: LessonResource[];
}

export interface LessonProgress {
  completedLessonIds: string[];
  percentage: number;
  completedLessons: number;
  totalLessons: number;
}

export async function fetchLessonDetail(lessonId: string): Promise<LessonDetail | null> {
  const res = await fetch(`${API_URL}/api/lessons/${lessonId}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch lesson");
  const json = (await res.json()) as { data: LessonDetail };
  return json.data;
}

export async function fetchLessonProgress(courseId: string): Promise<LessonProgress | null> {
  try {
    const [progressRes, lessonsRes] = await Promise.all([
      fetch(`${CLIENT_API_URL}/api/progress/courses/${courseId}`, { credentials: "include" }),
      fetch(`${CLIENT_API_URL}/api/progress/courses/${courseId}/lessons`, { credentials: "include" }),
    ]);
    if (!progressRes.ok) return null;
    const progress = (await progressRes.json()) as { percentage: number; completedLessons: number; totalLessons: number };
    const lessonIds = lessonsRes.ok
      ? ((await lessonsRes.json()) as { completedLessonIds: string[] }).completedLessonIds
      : [];
    return {
      completedLessonIds: lessonIds,
      percentage: progress.percentage,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons,
    };
  } catch {
    return null;
  }
}

export async function fetchLastAccessed(courseId: string): Promise<{ lessonId: string | null }> {
  try {
    const res = await fetch(`${CLIENT_API_URL}/api/progress/courses/${courseId}/last-accessed`, {
      credentials: "include",
    });
    if (!res.ok) return { lessonId: null };
    const data = (await res.json()) as { lastAccessedLesson: { id: string } | null };
    return { lessonId: data.lastAccessedLesson?.id ?? null };
  } catch {
    return { lessonId: null };
  }
}

export async function toggleLessonProgress(lessonId: string, isCompleted: boolean): Promise<void> {
  const res = await fetch(`${CLIENT_API_URL}/api/progress/lessons/${lessonId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isCompleted }),
  });
  if (!res.ok) throw new Error("Failed to update progress");
}
