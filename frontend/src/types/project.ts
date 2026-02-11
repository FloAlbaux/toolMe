export type Project = {
  id: string
  title: string
  domain: string
  shortDescription: string
  fullDescription: string
  deadline: string
  deliveryInstructions?: string
  createdAt: string
  ownerId: string
}

/** API response shape (snake_case from backend) */
export type ProjectApiResponse = {
  id: string
  title: string
  domain: string
  short_description: string
  full_description: string
  deadline: string
  delivery_instructions?: string | null
  created_at: string
  user_id: string
}

/** Payload for creating a project (camelCase, frontend) */
export type ProjectCreateInput = {
  title: string
  domain: string
  shortDescription: string
  fullDescription: string
  deadline: string
  deliveryInstructions?: string
}

/** Payload for updating a project (camelCase, partial) */
export type ProjectUpdateInput = {
  title?: string
  domain?: string
  shortDescription?: string
  fullDescription?: string
  deadline?: string
  deliveryInstructions?: string | null
}

export function mapProjectFromApi(raw: ProjectApiResponse): Project {
  return {
    id: raw.id,
    title: raw.title,
    domain: raw.domain,
    shortDescription: raw.short_description,
    fullDescription: raw.full_description,
    deadline: raw.deadline,
    deliveryInstructions: raw.delivery_instructions ?? undefined,
    createdAt: raw.created_at,
    ownerId: raw.user_id,
  }
}
