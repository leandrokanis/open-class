import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CourseCurriculum } from './CourseCurriculum'
import type { CourseModule } from '@/types/catalog'

const modules: CourseModule[] = [
  {
    id: 'mod-1',
    title: 'Fundamentos',
    order: 1,
    lessons: [
      { id: 'l1', title: 'Intro', contentType: 'video', duration: 480, order: 1 },
      { id: 'l2', title: 'Variáveis', contentType: 'video', duration: 900, order: 2 },
    ],
  },
  {
    id: 'mod-2',
    title: 'DOM e Eventos',
    order: 2,
    lessons: [
      { id: 'l3', title: 'DOM', contentType: 'video', duration: 600, order: 1 },
    ],
  },
]

describe('CourseCurriculum', () => {
  it('renders all modules', () => {
    render(<CourseCurriculum modules={modules} completedLessonIds={new Set()} />)
    expect(screen.getByText('Fundamentos')).toBeInTheDocument()
    expect(screen.getByText('DOM e Eventos')).toBeInTheDocument()
  })

  it('first module is expanded by default', () => {
    render(<CourseCurriculum modules={modules} completedLessonIds={new Set()} />)
    expect(screen.getByText('Intro')).toBeInTheDocument()
    expect(screen.queryByText('DOM')).not.toBeInTheDocument()
  })

  it('displays totals header with lesson count and module count', () => {
    render(<CourseCurriculum modules={modules} completedLessonIds={new Set()} />)
    expect(screen.getByText(/3 aulas/)).toBeInTheDocument()
    expect(screen.getByText(/2 módulos/)).toBeInTheDocument()
  })
})
