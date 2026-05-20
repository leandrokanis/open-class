const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

export interface CourseLesson {
  id: string;
  title: string;
  duration: number | null;
  order: number;
  contentType: string;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  thumbnailUrl: string | null;
  rating: number | null;
  reviewCount: number;
  category: { id: string; name: string; slug: string } | null;
  instructor: { name: string; avatarUrl?: string | null };
  modules: CourseModule[];
  createdAt: string;
}

export interface CourseProgress {
  percentage: number;
  completedLessons: number;
  totalLessons: number;
}

export async function fetchCourseDetail(slug: string, cookie?: string): Promise<CourseDetail | null> {
  const res = await fetch(`${API_URL}/api/catalog/${slug}`, {
    cache: "no-store",
    headers: cookie ? { Cookie: cookie } : {},
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch course");
  const json = (await res.json()) as { data: CourseDetail };
  return json.data;
}

export async function fetchCourseProgress(courseId: string): Promise<CourseProgress | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/progress/courses/${courseId}`,
      { credentials: "include" },
    );
    if (!res.ok) return null;
    return res.json() as Promise<CourseProgress>;
  } catch {
    return null;
  }
}

export async function fetchCompletedLessons(courseId: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/progress/courses/${courseId}/lessons`,
      { credentials: "include" },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { completedLessonIds: string[] };
    return json.completedLessonIds;
  } catch {
    return [];
  }
}

export interface EnrollmentStatus {
  authenticated: boolean;
  enrolled: boolean;
  progress: CourseProgress | null;
  completedLessonIds: string[];
}

export async function fetchEnrollmentStatus(courseId: string): Promise<EnrollmentStatus> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const progressRes = await fetch(`${base}/api/progress/courses/${courseId}`, {
      credentials: "include",
    });

    if (progressRes.status === 401) {
      return { authenticated: false, enrolled: false, progress: null, completedLessonIds: [] };
    }
    if (progressRes.status === 403) {
      return { authenticated: true, enrolled: false, progress: null, completedLessonIds: [] };
    }
    if (!progressRes.ok) {
      return { authenticated: false, enrolled: false, progress: null, completedLessonIds: [] };
    }

    const progress = (await progressRes.json()) as CourseProgress;

    const lessonsRes = await fetch(`${base}/api/progress/courses/${courseId}/lessons`, {
      credentials: "include",
    });
    const completedLessonIds = lessonsRes.ok
      ? ((await lessonsRes.json()) as { completedLessonIds: string[] }).completedLessonIds
      : [];

    return { authenticated: true, enrolled: true, progress, completedLessonIds };
  } catch {
    return { authenticated: false, enrolled: false, progress: null, completedLessonIds: [] };
  }
}

export async function enrollInCourse(courseId: string): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/enrollments`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    },
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? "Erro ao realizar inscrição. Tente novamente.");
  }
}
