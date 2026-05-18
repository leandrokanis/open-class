// Server-side: API_INTERNAL_URL (Docker network); Client-side: NEXT_PUBLIC_API_URL (browser)
const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
}

export interface CourseInstructor {
  name: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
}

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | null;
  thumbnailUrl: string | null;
  rating: number | null;
  reviewCount: number;
  lessonCount: number;
  totalDurationMinutes: number;
  category: CourseCategory | null;
  instructor: CourseInstructor;
  createdAt: string;
}

export interface CatalogPage {
  data: CourseListItem[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

export interface CatalogStats {
  totalCourses: number;
  totalInstructors: number;
  percentFree: number;
}

export interface CatalogParams {
  categoryId?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  q?: string;
  cursor?: string;
  limit?: number;
}

export async function fetchStats(): Promise<CatalogStats> {
  const res = await fetch(`${API_URL}/api/catalog/stats`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json() as Promise<CatalogStats>;
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const res = await fetch(`${API_URL}/api/catalog/categories`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('Failed to fetch categories');
  const json = (await res.json()) as { data: CategoryItem[] };
  return json.data;
}

export async function fetchCatalog(params: CatalogParams = {}): Promise<CatalogPage> {
  const searchParams = new URLSearchParams();
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.level) searchParams.set('level', params.level);
  if (params.q) searchParams.set('q', params.q);
  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.limit) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  const url = `${API_URL}/api/catalog${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch catalog');
  return res.json() as Promise<CatalogPage>;
}
