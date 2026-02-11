import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { mockProjects } from './data/mockProjects'
import * as projectsApi from './api/projects'

vi.mock('./api/projects', async (importOriginal) => {
  const actual = await importOriginal<typeof projectsApi>()
  return {
    ...actual,
    fetchProjects: vi.fn(),
  }
})

function renderApp() {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  )
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(projectsApi.fetchProjects).mockResolvedValue(mockProjects)
  })

  it('renders ToolMe identity', () => {
    renderApp()
    expect(screen.getByRole('heading', { level: 1, name: 'ToolMe' })).toBeInTheDocument()
    expect(screen.getByText('The sandbox where your projects matter.', { selector: 'p[lang="en"]' })).toBeInTheDocument()
  })

  it('has skip link to main content', () => {
    renderApp()
    const skip = screen.getByRole('link', { name: /skip to main content/i })
    expect(skip).toHaveAttribute('href', '#main')
  })

  it('renders landing highlight block with title and metaphor', () => {
    renderApp()
    expect(screen.getByRole('heading', { level: 3, name: 'Real projects. Useful work. Yours.' })).toBeInTheDocument()
    expect(screen.getByText('A sandbox with you, not above you.')).toBeInTheDocument()
  })

  it('renders projects section with all mock project cards', async () => {
    renderApp()
    expect(screen.getByRole('heading', { level: 2, name: 'Projects' })).toBeInTheDocument()
    const articles = await screen.findAllByRole('article')
    expect(articles).toHaveLength(mockProjects.length)
    mockProjects.forEach((project) => {
      expect(screen.getByRole('heading', { level: 3, name: project.title })).toBeInTheDocument()
      expect(screen.getByText(project.shortDescription)).toBeInTheDocument()
    })
  })
})
