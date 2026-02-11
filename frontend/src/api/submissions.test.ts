import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createSubmission,
  fetchMySubmissions,
  fetchMySubmissionForProject,
  fetchProjectSubmissions,
  fetchSubmissionWithMessages,
  setSubmissionCoherent,
  addSubmissionMessage,
  markSubmissionRead,
} from './submissions'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('submissions api', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('createSubmission sends payload and returns submission', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'sub-1',
          project_id: 'proj-1',
          learner_id: 'u1',
          link: 'https://example.com',
          file_ref: null,
          created_at: '2026-01-01T00:00:00Z',
          coherent: null,
          message_count: 1,
        }),
    })
    const sub = await createSubmission('proj-1', {
      message: 'My solution',
      link: 'https://example.com',
    })
    expect(sub.id).toBe('sub-1')
    expect(sub.projectId).toBe('proj-1')
    expect(sub.messageCount).toBe(1)
    expect(sub.unreadCount).toBe(0)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/projects/proj-1/submissions'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"message":"My solution"'),
      }),
    )
  })

  it('createSubmission throws on 409 with detail message', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ detail: 'You already have a submission for this project.' }),
    })
    await expect(createSubmission('proj-1', { message: 'Hi' })).rejects.toThrow(
      /already have a submission/,
    )
  })

  it('fetchMySubmissions returns mapped list', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 's1',
            project_id: 'p1',
            learner_id: 'u1',
            link: null,
            file_ref: null,
            created_at: '2026-01-01T00:00:00Z',
            coherent: true,
            message_count: 2,
            unread_count: 0,
          },
        ]),
    })
    const list = await fetchMySubmissions()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe('s1')
    expect(list[0].unreadCount).toBe(0)
  })

  it('fetchMySubmissionForProject returns null for 404', async () => {
    mockFetch.mockResolvedValue({ status: 404 })
    const result = await fetchMySubmissionForProject('proj-1')
    expect(result).toBeNull()
  })

  it('fetchSubmissionWithMessages returns null for 404', async () => {
    mockFetch.mockResolvedValue({ status: 404 })
    const result = await fetchSubmissionWithMessages('sub-1')
    expect(result).toBeNull()
  })

  it('setSubmissionCoherent returns submission', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 's1',
          project_id: 'p1',
          learner_id: 'u1',
          link: null,
          file_ref: null,
          created_at: '2026-01-01T00:00:00Z',
          coherent: true,
          message_count: 1,
        }),
    })
    const sub = await setSubmissionCoherent('s1', true)
    expect(sub).not.toBeNull()
    expect(sub!.coherent).toBe(true)
  })

  it('addSubmissionMessage returns message', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'm1',
          submission_id: 's1',
          sender_id: 'u1',
          body: 'Reply',
          created_at: '2026-01-01T00:00:00Z',
        }),
    })
    const msg = await addSubmissionMessage('s1', { body: 'Reply' })
    expect(msg.id).toBe('m1')
    expect(msg.body).toBe('Reply')
  })

  it('markSubmissionRead calls POST read', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204 })
    await markSubmissionRead('sub-1')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/submissions/sub-1/read'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('fetchProjectSubmissions returns list for owner', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 's1',
            project_id: 'p1',
            learner_id: 'u2',
            link: null,
            file_ref: null,
            created_at: '2026-01-01T00:00:00Z',
            coherent: null,
            message_count: 1,
            unread_count: 1,
          },
        ]),
    })
    const list = await fetchProjectSubmissions('p1')
    expect(list).toHaveLength(1)
    expect(list[0].unreadCount).toBe(1)
  })

  it('fetchProjectSubmissions returns empty array on 404', async () => {
    mockFetch.mockResolvedValue({ status: 404 })
    const list = await fetchProjectSubmissions('missing')
    expect(list).toEqual([])
  })
})
