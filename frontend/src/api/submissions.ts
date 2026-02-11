import { getApiBaseUrl } from './config'
import {
  mapSubmissionFromApi,
  mapSubmissionWithMessagesFromApi,
  type Message,
  type MessageApiResponse,
  type MessageCreateInput,
  type Submission,
  type SubmissionApiResponse,
  type SubmissionCreateInput,
  type SubmissionWithMessages,
  type SubmissionWithMessagesApiResponse,
} from '../types/submission'

const base = () => getApiBaseUrl()
const projectsBase = () => base() + '/projects'
const submissionsBase = () => base() + '/submissions'

const fetchOpts: RequestInit = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
}

function toCreatePayload(input: SubmissionCreateInput) {
  return {
    message: input.message,
    link: input.link ?? null,
    file_ref: input.fileRef ?? null,
  }
}

/** Create a submission for a project (message required, link optional). */
export async function createSubmission(
  projectId: string,
  input: SubmissionCreateInput
): Promise<Submission> {
  const res = await fetch(`${projectsBase()}/${projectId}/submissions`, {
    ...fetchOpts,
    method: 'POST',
    body: JSON.stringify(toCreatePayload(input)),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as { detail?: string })?.detail ?? `Failed to submit: ${res.status}`
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  const raw: SubmissionApiResponse = await res.json()
  return mapSubmissionFromApi(raw)
}

/** Get current user's submission for this project, if any (for apply page: 1 submission per project max). */
export async function fetchMySubmissionForProject(
  projectId: string
): Promise<Submission | null> {
  const res = await fetch(`${projectsBase()}/${projectId}/my-submission`, fetchOpts)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
  const raw: SubmissionApiResponse = await res.json()
  return mapSubmissionFromApi(raw)
}

/** List submissions by the current user (my submissions). */
export async function fetchMySubmissions(): Promise<Submission[]> {
  const res = await fetch(`${submissionsBase()}/me`, fetchOpts)
  if (!res.ok) throw new Error(`Failed to fetch my submissions: ${res.status}`)
  const raw: SubmissionApiResponse[] = await res.json()
  return raw.map(mapSubmissionFromApi)
}

/** List submissions for a project (owner only). */
export async function fetchProjectSubmissions(projectId: string): Promise<Submission[]> {
  const res = await fetch(`${projectsBase()}/${projectId}/submissions`, fetchOpts)
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`Failed to fetch project submissions: ${res.status}`)
  const raw: SubmissionApiResponse[] = await res.json()
  return raw.map(mapSubmissionFromApi)
}

/** Get one submission with message thread. */
export async function fetchSubmissionWithMessages(
  submissionId: string
): Promise<SubmissionWithMessages | null> {
  const res = await fetch(`${submissionsBase()}/${submissionId}`, fetchOpts)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch submission: ${res.status}`)
  const raw: SubmissionWithMessagesApiResponse = await res.json()
  return mapSubmissionWithMessagesFromApi(raw)
}

/** Mark the thread as read for the current user (call when opening the thread). */
export async function markSubmissionRead(submissionId: string): Promise<void> {
  const res = await fetch(`${submissionsBase()}/${submissionId}/read`, {
    ...fetchOpts,
    method: 'POST',
  })
  if (!res.ok) throw new Error(`Failed to mark read: ${res.status}`)
}

/** Owner: mark submission as coherent or not. */
export async function setSubmissionCoherent(
  submissionId: string,
  coherent: boolean
): Promise<Submission | null> {
  const res = await fetch(`${submissionsBase()}/${submissionId}/coherent`, {
    ...fetchOpts,
    method: 'PATCH',
    body: JSON.stringify({ coherent }),
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to update coherence: ${res.status}`)
  const raw: SubmissionApiResponse = await res.json()
  return mapSubmissionFromApi(raw)
}

/** Add a message to the submission thread. */
export async function addSubmissionMessage(
  submissionId: string,
  input: MessageCreateInput
): Promise<Message> {
  const res = await fetch(`${submissionsBase()}/${submissionId}/messages`, {
    ...fetchOpts,
    method: 'POST',
    body: JSON.stringify({ body: input.body }),
  })
  if (!res.ok) throw new Error(`Failed to send message: ${res.status}`)
  const raw: MessageApiResponse = await res.json()
  return {
    id: raw.id,
    submissionId: raw.submission_id,
    senderId: raw.sender_id,
    body: raw.body,
    createdAt: raw.created_at,
  }
}
