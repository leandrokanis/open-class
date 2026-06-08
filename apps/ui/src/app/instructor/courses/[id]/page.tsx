import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { fetchCourseEditor, fetchCategories } from '@/lib/instructor';
import CourseTab from '@/components/instructor/CourseTab';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseEditorPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookie = cookieStore.toString();

  const [course, categories] = await Promise.all([
    fetchCourseEditor(id, cookie),
    fetchCategories(cookie),
  ]);

  if (!course) notFound();

  return <CourseTab course={course} categories={categories} />;
}
