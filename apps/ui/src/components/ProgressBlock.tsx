import { Link } from 'react-router-dom'
import type { CourseProgress, LastAccessedLesson } from '@/types/progress'

interface Props {
  slug: string
  progress: CourseProgress | null
  lastAccessed: LastAccessedLesson | null
  globalLessonOrder: string[]
}

export function ProgressBlock({ slug, progress, lastAccessed, globalLessonOrder }: Props) {
  if (!progress) return null

  const lastLesson = lastAccessed?.lastAccessedLesson
  const globalOrder = lastLesson
    ? globalLessonOrder.indexOf(lastLesson.id) + 1
    : 0

  const buttonLabel = lastLesson && globalOrder > 0
    ? `▶ Continuar — Aula ${globalOrder}`
    : '▶ Começar Curso'

  const buttonHref = lastLesson
    ? `/courses/${slug}/lessons/${lastLesson.id}`
    : `/courses/${slug}`

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800">Seu progresso</span>
        <span className="font-bold text-gray-900">{progress.percentage}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-700 h-2 rounded-full transition-all"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <p className="text-sm text-gray-500">
        {progress.completedLessons} de {progress.totalLessons} aulas concluídas
      </p>

      <Link
        to={buttonHref}
        className="block w-full text-center bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {buttonLabel}
      </Link>
    </div>
  )
}
