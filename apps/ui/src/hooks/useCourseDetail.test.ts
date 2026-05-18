import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createWrapper } from '@/test-utils'
import { useCourseDetail } from './useCourseDetail'

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '@/lib/api'

const mockCourse = {
  id: 'course-1',
  title: 'JavaScript do Zero',
  slug: 'javascript-zero',
  shortDescription: 'Aprenda JS',
  level: 'intermediate',
  instructor: { name: 'Carlos Mendes' },
  modules: [],
  createdAt: '2026-01-01T00:00:00Z',
}

describe('useCourseDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns course data for a valid slug', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: mockCourse } })

    const { result } = renderHook(() => useCourseDetail('javascript-zero'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockCourse)
    expect(api.get).toHaveBeenCalledWith('/catalog/javascript-zero')
  })

  it('sets isError = true when API returns 404', async () => {
    const error = Object.assign(new Error('Not Found'), {
      response: { status: 404 },
    })
    vi.mocked(api.get).mockRejectedValueOnce(error)

    const { result } = renderHook(() => useCourseDetail('nao-existe'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
