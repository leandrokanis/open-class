import type { CourseDetail } from '@/types/catalog'
import { Breadcrumb } from './Breadcrumb'
import { InstructorCard } from './InstructorCard'
import { PreviewCard } from './PreviewCard'

interface Props {
  course: CourseDetail
  totalLessons: number
  totalDurationSeconds: number
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
}

export function HeroBanner({ course, totalLessons, totalDurationSeconds }: Props) {
  return (
    <section
      className="bg-[#1e2d5a] text-white py-8 px-4"
      aria-label="Hero do curso"
    >
      <div className="max-w-7xl mx-auto lg:flex lg:items-start lg:gap-8">
        {/* Left content */}
        <div className="flex-1 space-y-4">
          <Breadcrumb courseTitle={course.title} category={course.category} />

          <h1 className="text-2xl lg:text-3xl font-bold leading-tight">{course.title}</h1>

          {course.shortDescription && (
            <p className="text-blue-100 text-sm lg:text-base">{course.shortDescription}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-blue-100">
            <span>★ <strong className="text-yellow-400">4.8</strong></span>
            <span>·</span>
            <span>{totalLessons} aulas</span>
            {totalDurationSeconds > 0 && (
              <>
                <span>·</span>
                <span>{formatDuration(totalDurationSeconds)}</span>
              </>
            )}
            {course.level && (
              <>
                <span>·</span>
                <span>{LEVEL_LABEL[course.level] ?? course.level}</span>
              </>
            )}
          </div>

          <InstructorCard name={course.instructor.name} />
        </div>

        {/* Desktop preview card */}
        <div className="hidden lg:block w-[340px] flex-shrink-0">
          <PreviewCard
            thumbnailUrl={course.thumbnailUrl}
            totalDurationSeconds={totalDurationSeconds}
            variant="desktop"
          />
        </div>
      </div>
    </section>
  )
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}
