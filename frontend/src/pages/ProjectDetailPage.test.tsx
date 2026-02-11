import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProjectDetailPage } from './ProjectDetailPage'
import { mockProjects } from '../data/mockProjects'
import * as projectsApi from '../api/projects'

vi.mock('../api/projects', async (importOriginal) => {
  const actual = await importOriginal<typeof projectsApi>()
  return {
    ...actual,
    fetchProjectById: vi.fn(),
  }
})

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
  beforeEach(() => {
    vi.mocked(projectsApi.fetchProjectById).mockImplementation(async (id: string) => {
      const project = mockProjects.find((p) => p.id === id)
      return project ?? null
    })
  })

  it('renders project title and full description when project exists', async () => {
    const project = mockProjects[0]
    renderDetail(project.id)
    expect(await screen.findByRole('heading', { level: 1, name: project.title })).toBeInTheDocument()
    expect(screen.getByText(project.fullDescription)).toBeInTheDocument()
  })

  it('renders domain and delivery instructions when present', async () => {
    const project = mockProjects[0]
    renderDetail(project.id)
    expect(await screen.findByText(/Domain/)).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes(project.domain))).toBeInTheDocument()
    if (project.deliveryInstructions) {
      expect(screen.getByText(project.deliveryInstructions)).toBeInTheDocument()
    }
  })

  it('renders not found and back link when project id is invalid', async () => {
    vi.mocked(projectsApi.fetchProjectById).mockResolvedValue(null)
    renderDetail('invalid-id')
    expect(await screen.findByText(/Project not found/i)).toBeInTheDocument()
    const backLink = screen.getByRole('link', { name: /back to projects/i })
    expect(backLink).toHaveAttribute('href', '/')
  })
})
