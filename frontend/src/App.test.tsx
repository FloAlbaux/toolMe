import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders ToolMe identity', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'ToolMe' })).toBeInTheDocument()
    expect(screen.getByText('The sandbox where your projects matter.', { selector: 'p[lang="en"]' })).toBeInTheDocument()
  })

  it('has skip link to main content', () => {
    render(<App />)
    const skip = screen.getByRole('link', { name: /skip to main content/i })
    expect(skip).toHaveAttribute('href', '#main')
  })
})
