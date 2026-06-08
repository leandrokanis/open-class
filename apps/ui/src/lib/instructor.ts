const API_INTERNAL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

const API_PUBLIC = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function serverHeaders(cookie: string) {
  return { Cookie: cookie, 'Content-Type': 'application/json' };
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InstructorStats {
  totalStudents: number;
  publishedCount: number;
  avgRating: number | null;
  newEnrollmentsThisMonth: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Resource {
  id: string;
  label: string;
  url: string;
}

export interface LessonData {
  id: string;
  moduleId: string;
  title: string;
  youtubeUrl: string | null;
  youtubeVideoId: string | null;
  description: string | null;
  duration: number | null;
  visibility: 'visible' | 'hidden';
  position: number;
  resources: Resource[];
  contentType: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleWithLessons {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  position: number;
  visibility: 'visible' | 'hidden';
  lessons: LessonData[];
}

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  thumbnailUrl: string | null;
  rating: string | null;
  level: string | null;
  updatedAt: string;
  createdAt: string;
  enrollmentCount?: number;
  lessonCount?: number;
  instructorName?: string;
}

export interface CourseEditorData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | null;
  status: 'draft' | 'published';
  thumbnailUrl: string | null;
  categoryId: string | null;
  rating: string | null;
  modules: ModuleWithLessons[];
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

// ── Server-side fetchers ───────────────────────────────────────────────────────

export async function fetchInstructorStats(cookie: string): Promise<InstructorStats> {
  const res = await fetch(`${API_INTERNAL}/api/courses/stats`, {
    headers: serverHeaders(cookie),
    cache: 'no-store',
  });
  if (!res.ok) return { totalStudents: 0, publishedCount: 0, avgRating: null, newEnrollmentsThisMonth: 0 };
  const json = await res.json();
  return json.data;
}

export async function fetchMyCourses(
  cookie: string,
  params?: { page?: number; limit?: number },
): Promise<{ rows: CourseListItem[]; total: number }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const res = await fetch(`${API_INTERNAL}/api/courses/mine?${qs}`, {
    headers: serverHeaders(cookie),
    cache: 'no-store',
  });
  if (!res.ok) return { rows: [], total: 0 };
  const json = await res.json();
  return { rows: json.data, total: json.meta?.total ?? 0 };
}

export async function fetchCourseEditor(id: string, cookie: string): Promise<CourseEditorData | null> {
  const res = await fetch(`${API_INTERNAL}/api/courses/${id}`, {
    headers: serverHeaders(cookie),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function fetchCategories(cookie?: string): Promise<Category[]> {
  const headers = cookie ? serverHeaders(cookie) : { 'Content-Type': 'application/json' };
  const res = await fetch(`${API_INTERNAL}/api/categories?limit=100`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

// ── Client-side mutators ───────────────────────────────────────────────────────

export async function createCourse(data: {
  title: string;
  shortDescription?: string;
  description?: string;
  level?: string;
  categoryId?: string;
}): Promise<CourseEditorData | null> {
  const res = await fetch(`${API_PUBLIC}/api/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function updateCourse(
  id: string,
  data: {
    title?: string;
    shortDescription?: string;
    description?: string;
    level?: string;
    categoryId?: string;
    thumbnailUrl?: string | null;
  },
): Promise<CourseEditorData | null> {
  const res = await fetch(`${API_PUBLIC}/api/courses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function publishCourse(id: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${API_PUBLIC}/api/courses/${id}/publish`, {
    method: 'POST',
    credentials: 'include',
  });
  if (res.ok) return { ok: true };
  const json = await res.json().catch(() => ({}));
  return { ok: false, error: json.error ?? json.message ?? 'Erro ao publicar curso.' };
}

export async function unpublishCourse(id: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${API_PUBLIC}/api/courses/${id}/unpublish`, {
    method: 'POST',
    credentials: 'include',
  });
  if (res.ok) return { ok: true };
  const json = await res.json().catch(() => ({}));
  return { ok: false, error: json.error ?? json.message ?? 'Erro ao despublicar curso.' };
}

export async function deleteCourse(id: string): Promise<boolean> {
  const res = await fetch(`${API_PUBLIC}/api/courses/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.ok;
}

export async function uploadCourseThumbnail(id: string, file: File): Promise<CourseEditorData | null> {
  const form = new FormData();
  form.append('thumbnail', file);
  const res = await fetch(`${API_PUBLIC}/api/courses/${id}/thumbnail`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function reorderModules(courseId: string, ids: string[]): Promise<boolean> {
  const res = await fetch(`${API_PUBLIC}/api/courses/${courseId}/modules/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ids }),
  });
  return res.ok;
}

export async function reorderLessons(moduleId: string, ids: string[]): Promise<boolean> {
  const res = await fetch(`${API_PUBLIC}/api/modules/${moduleId}/lessons/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ids }),
  });
  return res.ok;
}

export async function moveLesson(id: string, moduleId: string, position: number): Promise<LessonData | null> {
  const res = await fetch(`${API_PUBLIC}/api/lessons/${id}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ moduleId, position }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function createModule(courseId: string, title: string): Promise<ModuleWithLessons | null> {
  const res = await fetch(`${API_PUBLIC}/api/courses/${courseId}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const data = json.data;
  return { ...data, lessons: data.lessons ?? [] };
}

export async function updateModule(
  courseId: string,
  id: string,
  data: { title?: string; description?: string },
): Promise<boolean> {
  const res = await fetch(`${API_PUBLIC}/api/courses/${courseId}/modules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.ok;
}

export async function setModuleVisibility(
  courseId: string,
  id: string,
  visibility: 'visible' | 'hidden',
): Promise<boolean> {
  const res = await fetch(`${API_PUBLIC}/api/courses/${courseId}/modules/${id}/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ visibility }),
  });
  return res.ok;
}

export async function deleteModule(courseId: string, id: string): Promise<boolean> {
  const res = await fetch(`${API_PUBLIC}/api/courses/${courseId}/modules/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.ok;
}

export async function createLesson(
  moduleId: string,
  data: { title: string; youtubeUrl?: string; description?: string },
): Promise<LessonData | null> {
  const res = await fetch(`${API_PUBLIC}/api/modules/${moduleId}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function updateLesson(
  id: string,
  data: { title?: string; youtubeUrl?: string; description?: string; isVisible?: boolean; duration?: number },
): Promise<LessonData | null> {
  const res = await fetch(`${API_PUBLIC}/api/lessons/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function setLessonVisibility(
  id: string,
  visibility: 'visible' | 'hidden',
): Promise<boolean> {
  const res = await fetch(`${API_PUBLIC}/api/lessons/${id}/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ visibility }),
  });
  return res.ok;
}

export async function deleteLesson(id: string): Promise<boolean> {
  const res = await fetch(`${API_PUBLIC}/api/lessons/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.ok;
}

export async function createResource(
  lessonId: string,
  data: { label: string; url: string },
): Promise<Resource | null> {
  const res = await fetch(`${API_PUBLIC}/api/lessons/${lessonId}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function deleteResource(lessonId: string, resourceId: string): Promise<boolean> {
  const res = await fetch(`${API_PUBLIC}/api/lessons/${lessonId}/resources/${resourceId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.ok;
}
