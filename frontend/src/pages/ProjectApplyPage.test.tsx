import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProjectApplyPage } from './ProjectApplyPage'
import { mockProjects } from '../data/mockProjects'
import * as projectsApi from '../api/projects'
import * as submissionsApi from '../api/submissions'

vi.mock('../api/projects', async (importOriginal) => {
  const actual = await importOriginal<typeof projectsApi>()
  return {
    ...actual,
    fetchProjectById: vi.fn(),
  }
})

vi.mock('../api/submissions', async (importOriginal) => {
  const actual = await importOriginal<typeof submissionsApi>()
  return {
    ...actual,
    fetchMySubmissionForProject: vi.fn(),
  }
})

const mockUseAuth = vi.fn()
vi.mock('../context/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderApply(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/project/${id}/apply`]}>
      <Routes>
        <Route path="/project/:id/apply" element={<ProjectApplyPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProjectApplyPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ userId: 'user-1' })
    vi.mocked(projectsApi.fetchProjectById).mockImplementation(async (projectId: string) => {
      const p = mockProjects.find((x) => x.id === projectId)
      return p ?? null
    })
    vi.mocked(submissionsApi.fetchMySubmissionForProject).mockResolvedValue(null)
  })

  it('shows loading then submission form when project exists and no existing submission', async () => {
    renderApply(mockProjects[0].id)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { level: 2, name: /submit a solution/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    const backLinks = screen.getAllByRole('link', { name: /back to project/i })
    expect(backLinks[0]).toHaveAttribute('href', `/project/${mockProjects[0].id}`)
  })

  it('shows not found when project id is invalid', async () => {
    vi.mocked(projectsApi.fetchProjectById).mockResolvedValue(null)
    renderApply('invalid-id')
    expect(await screen.findByText(/project not found/i)).toBeInTheDocument()
  })

  it('shows error when fetch fails', async () => {
    vi.mocked(projectsApi.fetchProjectById).mockRejectedValue(new Error('Network error'))
    renderApply(mockProjects[0].id)
    expect(await screen.findByText('Network error')).toBeInTheDocument()
  })
})
