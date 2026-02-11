import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchProjects,
  fetchMyProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
} from './projects'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('projects api', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('fetchProjects returns mapped projects and total', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          items: [
            {
              id: '1',
              title: 'P',
              domain: 'D',
              short_description: 'S',
              full_description: 'F',
              deadline: '2026-01-01',
              created_at: '2026-01-01T00:00:00Z',
              user_id: 'u1',
            },
          ],
          total: 1,
        }),
    })
    const { projects, total } = await fetchProjects()
    expect(projects).toHaveLength(1)
    expect(projects[0]).toMatchObject({ id: '1', title: 'P', ownerId: 'u1' })
    expect(total).toBe(1)
  })

  it('fetchProjects throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    await expect(fetchProjects()).rejects.toThrow(/500/)
  })

  it('fetchMyProjects returns mapped projects', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: '2',
            title: 'Mine',
            domain: 'D',
            short_description: 'S',
            full_description: 'F',
            deadline: '2026-01-01',
            created_at: '2026-01-01T00:00:00Z',
            user_id: 'me',
          },
        ]),
    })
    const projects = await fetchMyProjects()
    expect(projects[0].title).toBe('Mine')
    expect(projects[0].ownerId).toBe('me')
  })

  it('fetchProjectById returns null for 404', async () => {
    mockFetch.mockResolvedValue({ status: 404 })
    const project = await fetchProjectById('missing')
    expect(project).toBeNull()
  })

  it('createProject sends payload and returns project', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: '3',
          title: 'New',
          domain: 'D',
          short_description: 'S',
          full_description: 'F',
          deadline: '2026-01-01',
          created_at: '2026-01-01T00:00:00Z',
          user_id: 'u1',
        }),
    })
    const project = await createProject({
      title: 'New',
      domain: 'D',
      shortDescription: 'S',
      fullDescription: 'F',
      deadline: '2026-01-01',
    })
    expect(project.title).toBe('New')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('short_description'),
      }),
    )
  })

  it('updateProject sends partial payload', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: '3',
          title: 'Updated',
          domain: 'D',
          short_description: 'S',
          full_description: 'F',
          deadline: '2026-01-01',
          created_at: '2026-01-01T00:00:00Z',
          user_id: 'u1',
        }),
    })
    await updateProject('3', { title: 'Updated' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/3'),
      expect.objectContaining({ method: 'PUT' }),
    )
  })

  it('deleteProject returns true on success', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204 })
    const result = await deleteProject('1')
    expect(result).toBe(true)
  })

  it('deleteProject returns false on 404', async () => {
    mockFetch.mockResolvedValue({ status: 404 })
    const result = await deleteProject('missing')
    expect(result).toBe(false)
  })
})
