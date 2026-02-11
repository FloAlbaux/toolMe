import { describe, it, expect } from 'vitest'
import { mapProjectFromApi, type ProjectApiResponse } from './project'

describe('mapProjectFromApi', () => {
  it('maps snake_case API response to camelCase Project', () => {
    const raw: ProjectApiResponse = {
      id: 'id-1',
      title: 'Title',
      domain: 'Domain',
      short_description: 'Short',
      full_description: 'Full',
      deadline: '2026-06-15',
      delivery_instructions: 'Instructions',
      created_at: '2026-02-01T10:00:00.000Z',
      user_id: 'owner-1',
    }
    const project = mapProjectFromApi(raw)
    expect(project.id).toBe('id-1')
    expect(project.title).toBe('Title')
    expect(project.domain).toBe('Domain')
    expect(project.shortDescription).toBe('Short')
    expect(project.fullDescription).toBe('Full')
    expect(project.deadline).toBe('2026-06-15')
    expect(project.deliveryInstructions).toBe('Instructions')
    expect(project.createdAt).toBe('2026-02-01T10:00:00.000Z')
    expect(project.ownerId).toBe('owner-1')
  })

  it('maps null delivery_instructions to undefined', () => {
    const raw: ProjectApiResponse = {
      id: 'id-2',
      title: 'T',
      domain: 'D',
      short_description: 'S',
      full_description: 'F',
      deadline: '2026-01-01',
      delivery_instructions: null,
      created_at: '2026-01-01T00:00:00.000Z',
      user_id: 'owner-2',
    }
    const project = mapProjectFromApi(raw)
    expect(project.deliveryInstructions).toBeUndefined()
  })
})
