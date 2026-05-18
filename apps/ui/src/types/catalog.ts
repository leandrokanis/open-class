export interface CourseLesson {
  id: string
  title: string
  contentType: 'video' | 'text' | 'quiz'
  duration?: number | null
  order: number
}

export interface CourseModule {
  id: string
  title: string
  description?: string | null
  order: number
  lessons: CourseLesson[]
}

export interface CourseInstructor {
  name: string
}

export interface CourseCategory {
  id: string
  name: string
  slug: string
}

export interface CourseDetail {
  id: string
  title: string
  slug: string
  shortDescription?: string | null
  description?: string | null
  level?: 'beginner' | 'intermediate' | 'advanced' | null
  thumbnailUrl?: string | null
  category?: CourseCategory | null
  instructor: CourseInstructor
  modules: CourseModule[]
  createdAt: string
}
