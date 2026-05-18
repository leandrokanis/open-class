import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CourseDetail } from '@/types/catalog'

export function useCourseDetail(slug: string) {
  return useQuery<CourseDetail>({
    queryKey: ['course', slug],
    queryFn: async () => {
      const response = await api.get<{ data: CourseDetail }>(`/catalog/${slug}`)
      if (!response.data) throw Object.assign(new Error('Not found'), { response: { status: 404 } })
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(slug),
  })
}
