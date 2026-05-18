import { useQueries } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CourseProgress, LastAccessedLesson } from '@/types/progress'

export function useCourseProgress(courseId: string) {
  const enabled = Boolean(courseId)

  const results = useQueries({
    queries: [
      {
        queryKey: ['progress', courseId],
        queryFn: async () => {
          const res = await api.get<CourseProgress>(`/progress/courses/${courseId}`)
          return res.data
        },
        enabled,
        retry: false,
        staleTime: 30_000,
      },
      {
        queryKey: ['progress', courseId, 'last-accessed'],
        queryFn: async () => {
          const res = await api.get<LastAccessedLesson>(`/progress/courses/${courseId}/last-accessed`)
          return res.data
        },
        enabled,
        retry: false,
        staleTime: 30_000,
      },
    ],
  })

  const isLoading = enabled && (results[0].isLoading || results[1].isLoading)

  return {
    progress: results[0].data ?? null,
    lastAccessed: results[1].data ?? null,
    isLoading,
  }
}
