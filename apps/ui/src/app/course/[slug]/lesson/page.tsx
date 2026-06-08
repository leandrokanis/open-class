import { redirect, notFound } from "next/navigation";
import { fetchCourseDetail } from "@/lib/course-detail";
import { fetchLastAccessed } from "@/lib/lesson-player";
import { cookies } from "next/headers";

export default async function LessonIndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await fetchCourseDetail(slug);
  if (!course) notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  let targetLessonId: string | null = null;

  if (token) {
    const apiUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    try {
      const res = await fetch(`${apiUrl}/api/progress/courses/${course.id}/last-accessed`, {
        headers: { Cookie: `access_token=${token.value}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { lastAccessedLesson: { id: string } | null };
        targetLessonId = data.lastAccessedLesson?.id ?? null;
      }
    } catch {
      // fall through to first lesson
    }
  }

  if (!targetLessonId) {
    const firstLesson = course.modules[0]?.lessons[0];
    targetLessonId = firstLesson?.id ?? null;
  }

  if (!targetLessonId) notFound();

  redirect(`/course/${slug}/lesson/${targetLessonId}`);
}
