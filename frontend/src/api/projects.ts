import { getApiBaseUrl } from './config'
import { getStoredToken } from './auth'
import {
  mapProjectFromApi,
  type Project,
  type ProjectApiResponse,
  type ProjectCreateInput,
  type ProjectUpdateInput
} from '../types/project'

const base = () => getApiBaseUrl() + '/projects'

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getStoredToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

function toCreatePayload(input: ProjectCreateInput) {
  return {
    title: input.title,
    domain: input.domain,
    short_description: input.shortDescription,
    full_description: input.fullDescription,
    deadline: input.deadline,
    delivery_instructions: input.deliveryInstructions ?? null,
  }
}

function toUpdatePayload(input: ProjectUpdateInput) {
  const payload: Record<string, string | null | undefined> = {}
  if (input.title !== undefined) payload.title = input.title
  if (input.domain !== undefined) payload.domain = input.domain
  if (input.shortDescription !== undefined) payload.short_description = input.shortDescription
  if (input.fullDescription !== undefined) payload.full_description = input.fullDescription
  if (input.deadline !== undefined) payload.deadline = input.deadline
  if (input.deliveryInstructions !== undefined) payload.delivery_instructions = input.deliveryInstructions ?? null
  return payload
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(base())
  if (!res.ok) {
    throw new Error(`Failed to fetch projects: ${res.status}`)
  }
  const raw: ProjectApiResponse[] = await res.json()
  return raw.map(mapProjectFromApi)
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  const res = await fetch(`${base()}/${id}`)
  if (res.status === 404) {
    return null
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch project: ${res.status}`)
  }
  const raw: ProjectApiResponse = await res.json()
  return mapProjectFromApi(raw)
}

export async function createProject(input: ProjectCreateInput): Promise<Project> {
  const res = await fetch(base(), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(toCreatePayload(input)),
  })
  if (!res.ok) {
    throw new Error(`Failed to create project: ${res.status}`)
  }
  const raw: ProjectApiResponse = await res.json()
  return mapProjectFromApi(raw)
}

export async function updateProject(id: string, input: ProjectUpdateInput): Promise<Project | null> {
  const res = await fetch(`${base()}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(toUpdatePayload(input)),
  })
  if (res.status === 404) {
    return null
  }
  if (!res.ok) {
    throw new Error(`Failed to update project: ${res.status}`)
  }
  const raw: ProjectApiResponse = await res.json()
  return mapProjectFromApi(raw)
}

export async function deleteProject(id: string): Promise<boolean> {
  const res = await fetch(`${base()}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (res.status === 404) {
    return false
  }
  if (!res.ok) {
    throw new Error(`Failed to delete project: ${res.status}`)
  }
  return true
}
