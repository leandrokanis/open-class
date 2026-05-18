import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Breadcrumb } from './Breadcrumb'

describe('Breadcrumb', () => {
  it('renders Catálogo → Categoria → Curso', () => {
    render(
      <MemoryRouter>
        <Breadcrumb
          courseTitle="JavaScript do Zero"
          category={{ id: '1', name: 'Desenvolvimento Web', slug: 'dev-web' }}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('Catálogo')).toBeInTheDocument()
    expect(screen.getByText('Desenvolvimento Web')).toBeInTheDocument()
    expect(screen.getByText('JavaScript do Zero')).toBeInTheDocument()
  })

  it('renders Catálogo → Curso when no category', () => {
    render(
      <MemoryRouter>
        <Breadcrumb courseTitle="JavaScript do Zero" category={null} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Catálogo')).toBeInTheDocument()
    expect(screen.queryByText('Desenvolvimento Web')).not.toBeInTheDocument()
    expect(screen.getByText('JavaScript do Zero')).toBeInTheDocument()
  })
})
