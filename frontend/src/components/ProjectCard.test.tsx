import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectCard } from './ProjectCard'
import type { Project } from '../types/project'

const project: Project = {
  id: 'test-1',
  title: 'Test project',
  domain: 'Testing',
  shortDescription: 'A test project for unit tests.',
  fullDescription: '',
  deadline: '2026-06-15',
  createdAt: '2026-02-10T12:00:00.000Z',
  ownerId: 'owner-1',
}

describe('ProjectCard', () => {
  it('renders project title and domain', () => {
    render(<ProjectCard project={project} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Test project' })).toBeInTheDocument()
    expect(screen.getByText('Testing')).toBeInTheDocument()
  })

  it('renders short description', () => {
    render(<ProjectCard project={project} />)
    expect(screen.getByText('A test project for unit tests.')).toBeInTheDocument()
  })

  it('renders deadline label and formatted date', () => {
    render(<ProjectCard project={project} />)
    expect(screen.getByText(/Deadline/)).toBeInTheDocument()
    expect(screen.getByText(/Jun/i)).toBeInTheDocument()
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('is an article with correct aria-labelledby', () => {
    render(<ProjectCard project={project} />)
    const article = screen.getByRole('article', { name: 'Test project' })
    expect(article).toBeInTheDocument()
    expect(article).toHaveAttribute('aria-labelledby', 'project-title-test-1')
  })
})
