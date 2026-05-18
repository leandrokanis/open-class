import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CourseDetailPage from './CourseDetailPage'

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '@/lib/api'

const mockCourse = {
  id: 'course-1',
  title: 'JavaScript do Zero ao Avançado',
  slug: 'javascript-zero',
  shortDescription: 'Aprenda JS do zero',
  level: 'intermediate',
  thumbnailUrl: null,
  category: { id: 'cat-1', name: 'Desenvolvimento Web', slug: 'dev-web' },
  instructor: { name: 'Carlos Mendes' },
  modules: [
    {
      id: 'mod-1',
      title: 'Fundamentos',
      order: 1,
      lessons: [
        { id: 'l1', title: 'Introdução', contentType: 'video', duration: 480, order: 1 },
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
  ],
  createdAt: '2026-01-01T00:00:00Z',
}

function renderPage(slug = 'javascript-zero') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/courses/${slug}`]}>
        <Routes>
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CourseDetailPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders course h1, instructor and breadcrumb for unauthenticated visitor', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.includes('/catalog/')) return Promise.resolve({ data: { data: mockCourse } })
      return Promise.resolve({ data: null })
    })

    renderPage()

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'JavaScript do Zero ao Avançado' })).toBeInTheDocument(),
    )
    expect(screen.getAllByText('Carlos Mendes').length).toBeGreaterThan(0)
    expect(screen.getByText('Catálogo')).toBeInTheDocument()
    expect(screen.queryByText('Seu progresso')).not.toBeInTheDocument()
    expect(screen.queryByText(/Continuar/)).not.toBeInTheDocument()
  })

  it('renders ProgressBlock with 62% for enrolled student', async () => {
    const progressData = {
      courseId: 'course-1',
      completedLessons: 30,
      totalLessons: 48,
      percentage: 62,
    }
    const lastData = {
      lastAccessedLesson: { id: 'l3', title: 'DOM', order: 1 },
    }

    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.includes('/catalog/')) return Promise.resolve({ data: { data: mockCourse } })
      if (url.includes('last-accessed')) return Promise.resolve({ data: lastData })
      if (url.includes('/progress/')) return Promise.resolve({ data: progressData })
      return Promise.resolve({ data: null })
    })

    renderPage()

    await waitFor(() => expect(screen.getAllByText('62%').length).toBeGreaterThan(0))
    expect(screen.getAllByText('30 de 48 aulas concluídas').length).toBeGreaterThan(0)
  })

  it('renders 404 error when course slug does not exist', async () => {
    const error = Object.assign(new Error('Not Found'), {
      response: { status: 404 },
    })
    vi.mocked(api.get).mockRejectedValue(error)

    renderPage('nao-existe')

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /curso não encontrado/i })).toBeInTheDocument(),
    )
    expect(screen.getByRole('link', { name: /voltar ao catálogo/i })).toBeInTheDocument()
  })

  it('first module is expanded by default', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.includes('/catalog/')) return Promise.resolve({ data: { data: mockCourse } })
      return Promise.resolve({ data: null })
    })

    renderPage()

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'JavaScript do Zero ao Avançado' })).toBeInTheDocument(),
    )
    expect(screen.getByText('Introdução')).toBeInTheDocument()
    expect(screen.queryByText('DOM')).not.toBeInTheDocument()
  })
})
