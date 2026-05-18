import { useState } from 'react'
import type { CourseModule } from '@/types/catalog'
import { LessonRow } from './LessonRow'

interface Props {
  module: CourseModule
  moduleNumber: number
  completedLessonIds: Set<string>
  defaultOpen?: boolean
}

function totalModuleDuration(module: CourseModule): string {
  const seconds = module.lessons.reduce((sum, l) => sum + (l.duration ?? 0), 0)
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export function ModuleAccordion({ module, moduleNumber, completedLessonIds, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-lg mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded text-sm font-semibold text-gray-600 flex-shrink-0">
          {moduleNumber}
        </span>
        <span className="flex-1 font-medium text-gray-800">{module.title}</span>
        <span className="text-sm text-gray-500 flex-shrink-0">
          {module.lessons.length} aulas · {totalModuleDuration(module)}
        </span>
        <span className="text-gray-400 ml-2">{open ? '∧' : '∨'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-1">
          {module.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              isCompleted={completedLessonIds.has(lesson.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
