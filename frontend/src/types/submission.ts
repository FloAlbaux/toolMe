export type Submission = {
  id: string
  projectId: string
  learnerId: string
  link: string | null
  fileRef: string | null
  createdAt: string
  coherent: boolean | null
  messageCount: number
  unreadCount: number
}

export type SubmissionWithMessages = Submission & {
  messages: Message[]
}

export type Message = {
  id: string
  submissionId: string
  senderId: string
  body: string
  createdAt: string
}

/** API response shape (snake_case from backend) */
export type SubmissionApiResponse = {
  id: string
  project_id: string
  learner_id: string
  link: string | null
  file_ref: string | null
  created_at: string
  coherent: boolean | null
  message_count: number
  unread_count?: number
}

export type MessageApiResponse = {
  id: string
  submission_id: string
  sender_id: string
  body: string
  created_at: string
}

export type SubmissionWithMessagesApiResponse = SubmissionApiResponse & {
  messages: MessageApiResponse[]
}

export function mapSubmissionFromApi(raw: SubmissionApiResponse): Submission {
  return {
    id: raw.id,
    projectId: raw.project_id,
    learnerId: raw.learner_id,
    link: raw.link,
    fileRef: raw.file_ref,
    createdAt: raw.created_at,
    coherent: raw.coherent,
    messageCount: raw.message_count,
    unreadCount: raw.unread_count ?? 0,
  }
}

export function mapMessageFromApi(raw: MessageApiResponse): Message {
  return {
    id: raw.id,
    submissionId: raw.submission_id,
    senderId: raw.sender_id,
    body: raw.body,
    createdAt: raw.created_at,
  }
}

export function mapSubmissionWithMessagesFromApi(
  raw: SubmissionWithMessagesApiResponse
): SubmissionWithMessages {
  return {
    ...mapSubmissionFromApi(raw),
    messages: raw.messages.map(mapMessageFromApi),
  }
}

export type SubmissionCreateInput = {
  message: string
  link?: string | null
  fileRef?: string | null
}

export type MessageCreateInput = {
  body: string
}
