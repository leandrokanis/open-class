import type { CourseModule } from '@/types/catalog'
import { ModuleAccordion } from './ModuleAccordion'

interface Props {
  modules: CourseModule[]
  completedLessonIds: Set<string>
}

function totalDuration(modules: CourseModule[]): string {
  const seconds = modules.flatMap((m) => m.lessons).reduce((sum, l) => sum + (l.duration ?? 0), 0)
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export function CourseCurriculum({ modules, completedLessonIds }: Props) {
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Conteúdo do curso</h2>
        <span className="text-sm text-gray-500">
          {totalLessons} aulas · {modules.length} módulos · {totalDuration(modules)}
        </span>
      </div>

      {modules.map((module, index) => (
        <ModuleAccordion
          key={module.id}
          module={module}
          moduleNumber={index + 1}
          completedLessonIds={completedLessonIds}
          defaultOpen={index === 0}
        />
      ))}
    </section>
  )
}
