import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createWrapper } from '@/test-utils'
import { useCourseProgress } from './useCourseProgress'

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '@/lib/api'

describe('useCourseProgress', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns progress and last accessed lesson for authenticated student', async () => {
    const progressData = {
      courseId: 'course-1',
      completedLessons: 30,
      totalLessons: 48,
      percentage: 62.5,
    }
    const lastData = {
      lastAccessedLesson: { id: 'lesson-31', title: 'Cancelamento', order: 9 },
    }

    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: progressData })
      .mockResolvedValueOnce({ data: lastData })

    const { result } = renderHook(
      () => useCourseProgress('course-1'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.progress).toEqual(progressData)
    expect(result.current.lastAccessed).toEqual(lastData)
  })

  it('returns null silently when API responds 401 (unauthenticated)', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({ data: null })

    const { result } = renderHook(
      () => useCourseProgress('course-1'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.progress).toBeNull()
    expect(result.current.lastAccessed).toBeNull()
  })

  it('does not fetch when courseId is empty', () => {
    const { result } = renderHook(
      () => useCourseProgress(''),
      { wrapper: createWrapper() },
    )

    expect(result.current.isLoading).toBe(false)
    expect(api.get).not.toHaveBeenCalled()
  })
})
