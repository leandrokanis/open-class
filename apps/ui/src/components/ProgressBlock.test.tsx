import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProgressBlock } from './ProgressBlock'
import type { CourseProgress, LastAccessedLesson } from '@/types/progress'

const progress: CourseProgress = {
  courseId: 'course-1',
  completedLessons: 30,
  totalLessons: 48,
  percentage: 62.5,
}

const lastAccessed: LastAccessedLesson = {
  lastAccessedLesson: { id: 'l31', title: 'Cancelamento', order: 9 },
}

function wrap(children: React.ReactNode) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('ProgressBlock', () => {
  it('renders null when progress is null', () => {
    const { container } = render(
      wrap(<ProgressBlock slug="js-curso" progress={null} lastAccessed={null} globalLessonOrder={[]} />),
    )
    expect(container.firstChild).toBeNull()
  })

  it('displays percentage and lesson count', () => {
    render(
      wrap(
        <ProgressBlock
          slug="js-curso"
          progress={progress}
          lastAccessed={null}
          globalLessonOrder={[]}
        />,
      ),
    )
    expect(screen.getByText('62.5%')).toBeInTheDocument()
    expect(screen.getByText('30 de 48 aulas concluídas')).toBeInTheDocument()
  })

  it('displays continue button with global lesson order', () => {
    const lessonIds = Array.from({ length: 48 }, (_, i) => `lesson-${i + 1}`)
    const lastA: LastAccessedLesson = {
      lastAccessedLesson: { id: 'lesson-31', title: 'X', order: 1 },
    }
    render(
      wrap(
        <ProgressBlock
          slug="js-curso"
          progress={progress}
          lastAccessed={lastA}
          globalLessonOrder={lessonIds}
        />,
      ),
    )
    expect(screen.getByText('▶ Continuar — Aula 31')).toBeInTheDocument()
  })

  it('displays "Começar Curso" when no last accessed lesson', () => {
    render(
      wrap(
        <ProgressBlock
          slug="js-curso"
          progress={{ ...progress, completedLessons: 0, percentage: 0 }}
          lastAccessed={null}
          globalLessonOrder={[]}
        />,
      ),
    )
    expect(screen.getByText('▶ Começar Curso')).toBeInTheDocument()
  })
})
