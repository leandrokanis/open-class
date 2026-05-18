import { Link } from 'react-router-dom'
import type { CourseCategory } from '@/types/catalog'

interface Props {
  courseTitle: string
  category: CourseCategory | null | undefined
}

export function Breadcrumb({ courseTitle, category }: Props) {
  return (
    <nav className="flex items-center gap-1 text-xs text-blue-200 uppercase tracking-wide font-medium flex-wrap">
      <Link to="/" className="hover:text-white transition-colors">
        Catálogo
      </Link>
      {category && (
        <>
          <span>/</span>
          <Link
            to={`/?category=${category.slug}`}
            className="hover:text-white transition-colors"
          >
            {category.name}
          </Link>
        </>
      )}
      <span>/</span>
      <span className="text-white">{courseTitle}</span>
    </nav>
  )
}
