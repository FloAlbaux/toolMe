import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProjectEditPage } from './ProjectEditPage'
import { mockProjects } from '../data/mockProjects'
import * as projectsApi from '../api/projects'

vi.mock('../api/projects', async (importOriginal) => {
  const actual = await importOriginal<typeof projectsApi>()
  return {
    ...actual,
    fetchProjectById: vi.fn(),
    updateProject: vi.fn(),
  }
})

const mockUseAuth = vi.fn()
vi.mock('../context/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderEdit(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/project/${id}/edit`]}>
      <Routes>
        <Route path="/project/:id/edit" element={<ProjectEditPage />} />
        <Route path="/project/:id" element={<span>Project detail</span>} />
        <Route path="/" element={<span>Home</span>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProjectEditPage', () => {
  beforeEach(() => {
    const project = mockProjects[0]
    mockUseAuth.mockReturnValue({ userId: project.ownerId })
    vi.mocked(projectsApi.fetchProjectById).mockResolvedValue(project)
    vi.mocked(projectsApi.updateProject).mockResolvedValue(project)
  })

  it('renders loading then form when user is owner', async () => {
    renderEdit(mockProjects[0].id)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 2, name: /edit listing/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toHaveValue(mockProjects[0].title)
    expect(screen.getByLabelText(/domain/i)).toHaveValue(mockProjects[0].domain)
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('calls updateProject and navigates on submit', async () => {
    renderEdit(mockProjects[0].id)
    await screen.findByRole('heading', { level: 2, name: /edit listing/i })
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Updated title' } })
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(projectsApi.updateProject).toHaveBeenCalledWith(
      mockProjects[0].id,
      expect.objectContaining({ title: 'Updated title' }),
    )
    expect(await screen.findByText('Project detail')).toBeInTheDocument()
  })

  it('shows error when updateProject fails', async () => {
    vi.mocked(projectsApi.updateProject).mockRejectedValue(new Error('Update failed'))
    renderEdit(mockProjects[0].id)
    await screen.findByRole('heading', { level: 2, name: /edit listing/i })
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Update failed')
  })

  it('redirects to project when user is not owner', async () => {
    mockUseAuth.mockReturnValue({ userId: 'other-user' })
    renderEdit(mockProjects[0].id)
    expect(await screen.findByText('Project detail')).toBeInTheDocument()
  })
})
