import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MySubmissionsPage } from './MySubmissionsPage'
import * as submissionsApi from '../api/submissions'

vi.mock('../api/submissions', async (importOriginal) => {
  const actual = await importOriginal<typeof submissionsApi>()
  return {
    ...actual,
    fetchMySubmissions: vi.fn(),
  }
})

describe('MySubmissionsPage', () => {
  beforeEach(() => {
    vi.mocked(submissionsApi.fetchMySubmissions).mockResolvedValue([])
  })

  it('shows loading then empty state when no submissions', async () => {
    render(
      <MemoryRouter>
        <MySubmissionsPage />
      </MemoryRouter>,
    )
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { level: 1, name: /my submissions/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/not submitted any solution yet/i)).toBeInTheDocument()
  })

  it('shows list when submissions exist', async () => {
    vi.mocked(submissionsApi.fetchMySubmissions).mockResolvedValue([
      {
        id: 'sub-1',
        projectId: 'proj-1',
        learnerId: 'u1',
        link: null,
        fileRef: null,
        createdAt: '2026-01-01T00:00:00Z',
        coherent: true,
        messageCount: 2,
        unreadCount: 0,
      },
    ])
    render(
      <MemoryRouter>
        <MySubmissionsPage />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { level: 1, name: /my submissions/i })).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /submission.*messages/i })
    expect(link).toHaveAttribute('href', '/submission/sub-1')
  })
})
