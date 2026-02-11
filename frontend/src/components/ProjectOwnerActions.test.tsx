import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProjectOwnerActions } from './ProjectOwnerActions'

describe('ProjectOwnerActions', () => {
  it('renders Edit link and Delete button', () => {
    render(
      <MemoryRouter>
        <ProjectOwnerActions projectId="proj-1" onDelete={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute('href', '/project/proj-1/edit')
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('calls onDelete when Delete is clicked', () => {
    const onDelete = vi.fn()
    render(
      <MemoryRouter>
        <ProjectOwnerActions projectId="proj-1" onDelete={onDelete} />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('disables Delete button when deleting', () => {
    render(
      <MemoryRouter>
        <ProjectOwnerActions projectId="proj-1" onDelete={vi.fn()} deleting />
      </MemoryRouter>,
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('…')
  })
})
