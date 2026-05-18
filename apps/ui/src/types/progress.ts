export interface CourseProgress {
  courseId: string
  completedLessons: number
  totalLessons: number
  percentage: number
}

export interface LastAccessedLesson {
  lastAccessedLesson: {
    id: string
    title: string
    order: number
    moduleId?: string
  } | null
}
