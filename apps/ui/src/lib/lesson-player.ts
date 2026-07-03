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
  isExtra?: boolean;
  resources: LessonResource[];
}

export interface ModuleExtrasStatus {
  moduleId: string;
  hasExtras: boolean;
  unlocked: boolean;
  celebrated: boolean;
}

export async function fetchExtrasStatus(courseId: string): Promise<ModuleExtrasStatus[]> {
  try {
    const res = await fetch(`${CLIENT_API_URL}/api/progress/courses/${courseId}/extras`, {
      credentials: "include",
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: ModuleExtrasStatus[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function postExtrasCelebration(moduleId: string): Promise<boolean> {
  try {
    const res = await fetch(`${CLIENT_API_URL}/api/progress/modules/${moduleId}/extras-celebration`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface LessonProgress {
  completedLessonIds: string[];
  percentage: number;
  completedLessons: number;
  totalLessons: number;
}

export async function fetchLessonDetail(lessonId: string, cookie?: string): Promise<LessonDetail | null> {
  const res = await fetch(`${API_URL}/api/lessons/${lessonId}`, {
    cache: "no-store",
    headers: cookie ? { Cookie: cookie } : {},
  });
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

// ── Cronograma de turma (US-24) ────────────────────────────────────────────────

export interface MyCohortLite {
  id: string;
  courseId: string;
  name: string;
  closedAt: string | null;
  schedule: Array<{ moduleId: string; availableFrom: string }>;
}

/** Turma do aluno para este curso (ou null). Locks de módulo derivam do cronograma. */
export async function fetchMyCohortForCourse(courseId: string): Promise<MyCohortLite | null> {
  try {
    const res = await fetch(`${CLIENT_API_URL}/api/cohorts/me`, { credentials: "include" });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: MyCohortLite[] };
    return (json.data ?? []).find((c) => c.courseId === courseId) ?? null;
  } catch {
    return null;
  }
}
