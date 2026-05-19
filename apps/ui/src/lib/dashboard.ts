const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

export interface MeUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface EnrollmentCategory {
  id: string;
  name: string;
  slug: string;
}

export interface EnrollmentCourse {
  id: string;
  title: string;
  slug: string;
  level: string | null;
  thumbnailUrl: string | null;
  totalDurationMinutes: number;
  category: EnrollmentCategory | null;
  instructor: { name: string };
}

export interface EnrollmentProgress {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface EnrollmentWithProgress {
  id: string;
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
  course: EnrollmentCourse;
  progress: EnrollmentProgress;
  lastLesson: { id: string; title: string } | null;
}

export interface RecentActivityItem {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  isCompleted: boolean;
  updatedAt: string;
}

function authHeaders(cookie: string): HeadersInit {
  return { Cookie: cookie };
}

export async function fetchMe(cookie: string): Promise<MeUser | null> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: authHeaders(cookie),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data: MeUser };
  return json.data;
}

export async function fetchMyEnrollments(cookie: string): Promise<EnrollmentWithProgress[]> {
  const res = await fetch(`${API_URL}/api/enrollments/me`, {
    headers: authHeaders(cookie),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json() as Promise<EnrollmentWithProgress[]>;
}

export async function fetchRecentActivity(
  cookie: string,
  limit = 5,
): Promise<RecentActivityItem[]> {
  const res = await fetch(`${API_URL}/api/progress/recent?limit=${limit}`, {
    headers: authHeaders(cookie),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json() as Promise<RecentActivityItem[]>;
}
