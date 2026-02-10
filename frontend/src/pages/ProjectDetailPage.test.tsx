import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProjectDetailPage } from './ProjectDetailPage'
import { mockProjects } from '../data/mockProjects'

function renderDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/project/${id}`]}>
      <Routes>
        <Route path="/project/:id" element={<ProjectDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProjectDetailPage', () => {
  it('renders project title and full description when project exists', () => {
    const project = mockProjects[0]
    renderDetail(project.id)
    expect(screen.getByRole('heading', { level: 1, name: project.title })).toBeInTheDocument()
    expect(screen.getByText(project.fullDescription)).toBeInTheDocument()
  })

  it('renders domain and delivery instructions when present', () => {
    const project = mockProjects[0]
    renderDetail(project.id)
    expect(screen.getByText(/Domain/)).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes(project.domain))).toBeInTheDocument()
    if (project.deliveryInstructions) {
      expect(screen.getByText(project.deliveryInstructions)).toBeInTheDocument()
    }
  })

  it('renders not found and back link when project id is invalid', () => {
    renderDetail('invalid-id')
    expect(screen.getByText('Project not found')).toBeInTheDocument()
    const backLink = screen.getByRole('link', { name: /back to projects/i })
    expect(backLink).toHaveAttribute('href', '/')
  })
})
