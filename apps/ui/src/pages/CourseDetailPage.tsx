import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useCourseDetail } from '@/hooks/useCourseDetail'
import { useCourseProgress } from '@/hooks/useCourseProgress'
import { HeroBanner } from '@/components/HeroBanner'
import { PreviewCard } from '@/components/PreviewCard'
import { ProgressBlock } from '@/components/ProgressBlock'
import { CourseCurriculum } from '@/components/CourseCurriculum'
import { CourseInfoSidebar } from '@/components/CourseInfoSidebar'
import { InstructorCard } from '@/components/InstructorCard'
import type { CourseModule } from '@/types/catalog'

function totalDurationSeconds(modules: CourseModule[]): number {
  return modules.flatMap((m) => m.lessons).reduce((sum, l) => sum + (l.duration ?? 0), 0)
}

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const {
    data: course,
    isLoading: courseLoading,
    isError,
  } = useCourseDetail(slug ?? '')

  const { progress, lastAccessed, isLoading: progressLoading } =
    useCourseProgress(course?.id ?? '')

  const totalLessons = useMemo(
    () => (course ? course.modules.reduce((s, m) => s + m.lessons.length, 0) : 0),
    [course],
  )

  const totalSeconds = useMemo(
    () => (course ? totalDurationSeconds(course.modules) : 0),
    [course],
  )

  const globalLessonOrder = useMemo(
    () => (course ? course.modules.flatMap((m) => m.lessons.map((l) => l.id)) : []),
    [course],
  )

  const completedLessonIds = useMemo(() => {
    if (!progress || !course) return new Set<string>()
    const completedCount = progress.completedLessons
    const ids = globalLessonOrder.slice(0, completedCount)
    return new Set(ids)
  }, [progress, course, globalLessonOrder])

  if (courseLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Carregando curso...</div>
      </div>
    )
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Curso não encontrado</h1>
        <p className="text-gray-500">O curso que você procura não existe ou foi removido.</p>
        <Link
          to="/"
          className="text-blue-600 hover:underline font-medium"
        >
          Voltar ao catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile preview (full-width, above hero info on mobile) */}
      <div className="lg:hidden bg-[#1e2d5a]">
        <PreviewCard
          thumbnailUrl={course.thumbnailUrl}
          totalDurationSeconds={totalSeconds}
          variant="mobile"
        />
      </div>

      {/* Hero banner (contains desktop preview card inside) */}
      <HeroBanner
        course={course}
        totalLessons={totalLessons}
        totalDurationSeconds={totalSeconds}
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:flex lg:gap-8 lg:items-start">
        {/* Left column */}
        <div className="flex-1 space-y-8">
          {/* Description */}
          {course.description && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Sobre este curso</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
            </section>
          )}

          {/* Curriculum */}
          <CourseCurriculum
            modules={course.modules}
            completedLessonIds={completedLessonIds}
          />
        </div>

        {/* Right sidebar (desktop only) */}
        <aside className="hidden lg:block w-[340px] flex-shrink-0 space-y-4">
          {progress && (
            <ProgressBlock
              slug={course.slug}
              progress={progress}
              lastAccessed={lastAccessed}
              globalLessonOrder={globalLessonOrder}
            />
          )}

          {/* Instructor card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {course.instructor.name[0]}
              </div>
              <div>
                <p className="text-xs text-gray-500">Instrutor</p>
                <p className="text-sm font-medium text-gray-800">{course.instructor.name}</p>
              </div>
            </div>
          </div>

          <CourseInfoSidebar
            course={course}
            totalLessons={totalLessons}
            totalDurationSeconds={totalSeconds}
          />
        </aside>
      </div>

      {/* Mobile progress block (below main content) */}
      {progress && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 p-4 bg-white border-t border-gray-200 shadow-lg">
          <ProgressBlock
            slug={course.slug}
            progress={progress}
            lastAccessed={lastAccessed}
            globalLessonOrder={globalLessonOrder}
          />
        </div>
      )}
    </div>
  )
}
