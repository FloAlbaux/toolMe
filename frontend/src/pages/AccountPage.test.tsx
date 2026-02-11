import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AccountPage } from './AccountPage'
import { mockProjects } from '../data/mockProjects'
import * as projectsApi from '../api/projects'

vi.mock('../api/projects', async (importOriginal) => {
  const actual = await importOriginal<typeof projectsApi>()
  return {
    ...actual,
    fetchMyProjects: vi.fn(),
  }
})

vi.mock('../context/useAuth', () => ({
  useAuth: () => ({ userId: 'user-1' }),
}))

describe('AccountPage', () => {
  beforeEach(() => {
    vi.mocked(projectsApi.fetchMyProjects).mockResolvedValue([])
  })

  it('renders heading and loading then empty state', async () => {
    render(
      <MemoryRouter>
        <AccountPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 2, name: /my listings/i })).toBeInTheDocument()
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(await screen.findByText(/you haven't published any listing yet/i)).toBeInTheDocument()
  })

  it('renders error and back link when fetch fails', async () => {
    vi.mocked(projectsApi.fetchMyProjects).mockRejectedValue(new Error('Network error'))
    render(
      <MemoryRouter>
        <AccountPage />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Network error')).toBeInTheDocument()
    const backLinks = screen.getAllByRole('link', { name: /back to home/i })
    expect(backLinks.length).toBeGreaterThanOrEqual(1)
    expect(backLinks[0]).toHaveAttribute('href', '/')
  })

  it('renders list of projects when fetch succeeds', async () => {
    vi.mocked(projectsApi.fetchMyProjects).mockResolvedValue([mockProjects[0], mockProjects[1]])
    render(
      <MemoryRouter>
        <AccountPage />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { level: 3, name: mockProjects[0].title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: mockProjects[1].title })).toBeInTheDocument()
    const links = screen.getAllByRole('link', { name: mockProjects[0].title })
    expect(links[0]).toHaveAttribute('href', `/project/${mockProjects[0].id}`)
  })
})
