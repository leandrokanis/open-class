import type { CourseLesson } from '@/types/catalog'

interface Props {
  lesson: CourseLesson
  isCompleted: boolean
}

function formatDuration(seconds: number): string {
  const min = Math.round(seconds / 60)
  return `${min}min`
}

export function LessonRow({ lesson, isCompleted }: Props) {
  return (
    <div className="flex items-center gap-3 py-2 px-1">
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {isCompleted ? (
          <span
            data-testid="lesson-check"
            className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs"
          >
            ✓
          </span>
        ) : (
          <span
            data-testid="lesson-pending"
            className="w-5 h-5 rounded-full border-2 border-gray-300"
          />
        )}
      </span>

      <span
        className={`flex-1 text-sm ${isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}
      >
        {lesson.title}
      </span>

      {lesson.duration != null && (
        <span className="text-xs text-gray-500 flex-shrink-0">
          {formatDuration(lesson.duration)}
        </span>
      )}
    </div>
  )
}
