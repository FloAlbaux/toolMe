import { describe, it, expect } from 'vitest'
import type { Project } from '../types/project'
import { mockProjects } from './mockProjects'

const requiredKeys: (keyof Project)[] = ['id', 'title', 'domain', 'shortDescription', 'fullDescription', 'deadline', 'createdAt']

describe('mockProjects', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(mockProjects)).toBe(true)
    expect(mockProjects.length).toBeGreaterThan(0)
  })

  it('each project has required fields', () => {
    mockProjects.forEach((project, index) => {
      requiredKeys.forEach((key) => {
        expect(project[key], `project at index ${index} missing "${key}"`).toBeDefined()
        expect(typeof project[key]).toBe('string')
        expect((project[key] as string).length).toBeGreaterThan(0)
      })
    })
  })

  it('each project has unique id', () => {
    const ids = mockProjects.map((p) => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('deadline strings are parseable as dates', () => {
    mockProjects.forEach((project) => {
      const date = new Date(project.deadline)
      expect(Number.isNaN(date.getTime())).toBe(false)
    })
  })
})
