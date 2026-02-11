import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PublishPage } from './PublishPage'
import * as projectsApi from '../api/projects'
import { mockProjects } from '../data/mockProjects'

vi.mock('../api/projects', async (importOriginal) => {
  const actual = await importOriginal<typeof projectsApi>()
  return {
    ...actual,
    createProject: vi.fn(),
  }
})

describe('PublishPage', () => {
  beforeEach(() => {
    vi.mocked(projectsApi.createProject).mockResolvedValue(mockProjects[0])
  })

  it('renders publish form with all fields', () => {
    render(
      <MemoryRouter>
        <PublishPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 2, name: /publish a project/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/domain/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/short description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/deadline/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /publish project/i })).toBeInTheDocument()
  })

  it('calls createProject and navigates to project on success', async () => {
    render(
      <MemoryRouter initialEntries={['/publish']}>
        <Routes>
          <Route path="/publish" element={<PublishPage />} />
          <Route path="/project/:id" element={<span>Project detail</span>} />
        </Routes>
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'My project' } })
    fireEvent.change(screen.getByLabelText(/domain/i), { target: { value: 'Web' } })
    fireEvent.change(screen.getByLabelText(/short description/i), { target: { value: 'Short' } })
    fireEvent.change(screen.getByLabelText(/full description/i), { target: { value: 'Full description' } })
    fireEvent.change(screen.getByLabelText(/deadline/i), { target: { value: '2026-12-31' } })
    fireEvent.click(screen.getByRole('button', { name: /publish project/i }))
    expect(projectsApi.createProject).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'My project',
        domain: 'Web',
        shortDescription: 'Short',
        fullDescription: 'Full description',
        deadline: '2026-12-31',
      }),
    )
    expect(await screen.findByText('Project detail')).toBeInTheDocument()
  })

  it('shows error when createProject fails', async () => {
    vi.mocked(projectsApi.createProject).mockRejectedValue(new Error('Network error'))
    render(
      <MemoryRouter>
        <PublishPage />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'My project' } })
    fireEvent.change(screen.getByLabelText(/domain/i), { target: { value: 'Web' } })
    fireEvent.change(screen.getByLabelText(/short description/i), { target: { value: 'Short' } })
    fireEvent.change(screen.getByLabelText(/full description/i), { target: { value: 'Full' } })
    fireEvent.change(screen.getByLabelText(/deadline/i), { target: { value: '2026-12-31' } })
    fireEvent.click(screen.getByRole('button', { name: /publish project/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Network error')
  })
})
