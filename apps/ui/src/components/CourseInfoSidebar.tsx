import { Link } from 'react-router-dom'
import type { CourseDetail } from '@/types/catalog'

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

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export function CourseInfoSidebar({ course, totalLessons, totalDurationSeconds }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 text-sm">
      {course.level && (
        <Row label="Nível" value={LEVEL_LABEL[course.level] ?? course.level} />
      )}
      <Row label="Total de aulas" value={`${totalLessons} aulas`} />
      <Row label="Duração total" value={formatDuration(totalDurationSeconds)} />
      {course.category && (
        <div className="flex justify-between">
          <span className="text-gray-500">Categoria</span>
          <Link
            to={`/?category=${course.category.slug}`}
            className="font-medium text-blue-600 hover:underline"
          >
            {course.category.name}
          </Link>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}
