import { notFound } from "next/navigation";
import { fetchCourseDetail } from "@/lib/course-detail";
import { fetchLessonDetail } from "@/lib/lesson-player";
import { PlayerLayout } from "@/components/lesson-player/PlayerLayout";
import { NotEnrolledGate } from "@/components/lesson-player/NotEnrolledGate";
import { cookies } from "next/headers";

async function getEnrollmentStatus(courseId: string): Promise<"enrolled" | "not-enrolled" | "unauthenticated"> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");
  if (!token) return "unauthenticated";

  const apiUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/api/progress/courses/${courseId}`, {
      headers: { Cookie: `access_token=${token.value}` },
      cache: "no-store",
    });
    if (res.status === 403) return "not-enrolled";
    if (res.status === 401) return "unauthenticated";
    if (res.ok) return "enrolled";
    return "unauthenticated";
  } catch {
    return "unauthenticated";
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;

  const cookieStore = await cookies();
  const cookie = cookieStore.toString();

  const [course, lesson] = await Promise.all([
    fetchCourseDetail(slug, cookie),
    fetchLessonDetail(lessonId, cookie),
  ]);

  if (!course || !lesson) notFound();

  const allModuleIds = new Set(course.modules.map((m) => m.id));
  if (!allModuleIds.has(lesson.moduleId)) notFound();

  const enrollment = await getEnrollmentStatus(course.id);
  if (enrollment === "not-enrolled") {
    return <NotEnrolledGate courseSlug={slug} courseTitle={course.title} />;
  }

  return (
    <PlayerLayout
      lesson={lesson}
      modules={course.modules}
      courseId={course.id}
      courseTitle={course.title}
      courseSlug={slug}
    />
  );
}
