import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LessonRow } from './LessonRow'
import type { CourseLesson } from '@/types/catalog'

const baseLesson: CourseLesson = {
  id: 'lesson-1',
  title: 'Introdução ao JavaScript',
  contentType: 'video',
  duration: 480,
  order: 1,
}

describe('LessonRow', () => {
  it('displays lesson title and formatted duration', () => {
    render(<LessonRow lesson={baseLesson} isCompleted={false} />)
    expect(screen.getByText('Introdução ao JavaScript')).toBeInTheDocument()
    expect(screen.getByText('8min')).toBeInTheDocument()
  })

  it('shows check icon and line-through for completed lesson', () => {
    render(<LessonRow lesson={baseLesson} isCompleted={true} />)
    const title = screen.getByText('Introdução ao JavaScript')
    expect(title).toHaveClass('line-through')
    expect(screen.getByTestId('lesson-check')).toBeInTheDocument()
  })

  it('shows empty circle icon for pending lesson', () => {
    render(<LessonRow lesson={baseLesson} isCompleted={false} />)
    expect(screen.getByTestId('lesson-pending')).toBeInTheDocument()
  })

  it('shows no duration when duration is null', () => {
    const lesson = { ...baseLesson, duration: null }
    render(<LessonRow lesson={lesson} isCompleted={false} />)
    expect(screen.queryByText(/min/)).not.toBeInTheDocument()
  })
})
