import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModuleAccordion } from './ModuleAccordion'
import type { CourseModule } from '@/types/catalog'

const mockModule: CourseModule = {
  id: 'mod-1',
  title: 'Fundamentos do JavaScript',
  order: 1,
  lessons: [
    { id: 'l1', title: 'Introdução', contentType: 'video', duration: 480, order: 1 },
    { id: 'l2', title: 'Variáveis', contentType: 'video', duration: 900, order: 2 },
  ],
}

describe('ModuleAccordion', () => {
  it('starts collapsed by default', () => {
    render(
      <ModuleAccordion
        module={mockModule}
        moduleNumber={1}
        completedLessonIds={new Set()}
      />,
    )
    expect(screen.queryByText('Introdução')).not.toBeInTheDocument()
  })

  it('starts expanded when defaultOpen is true', () => {
    render(
      <ModuleAccordion
        module={mockModule}
        moduleNumber={1}
        completedLessonIds={new Set()}
        defaultOpen
      />,
    )
    expect(screen.getByText('Introdução')).toBeInTheDocument()
  })

  it('expands when header is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ModuleAccordion
        module={mockModule}
        moduleNumber={1}
        completedLessonIds={new Set()}
      />,
    )
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Introdução')).toBeInTheDocument()
  })

  it('collapses when header is clicked again', async () => {
    const user = userEvent.setup()
    render(
      <ModuleAccordion
        module={mockModule}
        moduleNumber={1}
        completedLessonIds={new Set()}
        defaultOpen
      />,
    )
    await user.click(screen.getByRole('button'))
    expect(screen.queryByText('Introdução')).not.toBeInTheDocument()
  })

  it('displays module number, title and lesson count', () => {
    render(
      <ModuleAccordion
        module={mockModule}
        moduleNumber={1}
        completedLessonIds={new Set()}
      />,
    )
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Fundamentos do JavaScript')).toBeInTheDocument()
    expect(screen.getByText(/2 aulas/)).toBeInTheDocument()
  })
})
