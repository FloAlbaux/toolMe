import { useEffect, useState, useTransition } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Translate } from '../components/Translate'
import { useAuth } from '../context/useAuth'
import {
  fetchSubmissionWithMessages,
  addSubmissionMessage,
  setSubmissionCoherent,
  markSubmissionRead,
} from '../api/submissions'
import { fetchProjectById } from '../api/projects'
import type { SubmissionWithMessages } from '../types/submission'
import type { Project } from '../types/project'

export function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { userId } = useAuth()
  const [submission, setSubmission] = useState<SubmissionWithMessages | null | undefined>(undefined)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [settingCoherent, setSettingCoherent] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const isLearner = !!userId && !!submission && submission.learnerId === userId
  const isOwner = !!userId && !!project && project.ownerId === userId

  useEffect(() => {
    if (!id) {
      setSubmission(null)
      setLoading(false)
      return
    }
    let cancelled = false
    startTransition(() => {
      setLoading(true)
      setError(null)
    })
    fetchSubmissionWithMessages(id)
      .then((data) => {
        if (!cancelled && data) {
          setSubmission(data)
          markSubmissionRead(id).catch(() => {})
          return fetchProjectById(data.projectId)
        }
        return null
      })
      .then((proj) => {
        if (!cancelled && proj) setProject(proj)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!id || !newMessage.trim() || sending) return
    setSending(true)
    try {
      await addSubmissionMessage(id, { body: newMessage.trim() })
      const updated = await fetchSubmissionWithMessages(id)
      if (updated) setSubmission(updated)
      setNewMessage('')
    } finally {
      setSending(false)
    }
  }

  async function handleSetCoherent(coherent: boolean) {
    if (!id || !submission) return
    setSettingCoherent(id)
    try {
      await setSubmissionCoherent(id, coherent)
      const updated = await fetchSubmissionWithMessages(id)
      if (updated) setSubmission(updated)
    } finally {
      setSettingCoherent(null)
    }
  }

  if (loading && submission === undefined) {
    return (
      <output className="text-stone-500" aria-live="polite">
        Loading…
      </output>
    )
  }

  if (error || submission == null) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8">
        <p className="text-stone-600">{error ?? 'Submission not found.'}</p>
        <Link
          to="/my-submissions"
          className="mt-4 inline-block text-[var(--color-toolme-primary)] font-medium hover:underline"
        >
          <Translate tid="mySubmissions.title" />
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-8">
      <p className="mb-4">
        <Link
          to="/my-submissions"
          className="text-[var(--color-toolme-primary)] font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2 rounded"
        >
          ← <Translate tid="mySubmissions.title" />
        </Link>
      </p>
      {project && (
        <p className="mb-2">
          <Link
            to={`/project/${project.id}`}
            className="text-[var(--color-toolme-primary)] hover:underline"
          >
            {project.title}
          </Link>
        </p>
      )}

      {submission.link && (
        <p className="mb-4 text-sm">
          <Translate tid="submissionDetail.link" />:{' '}
          <a
            href={submission.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-toolme-primary)] hover:underline"
          >
            {submission.link}
          </a>
        </p>
      )}

      {isOwner && submission.coherent === null && (
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => handleSetCoherent(true)}
            disabled={settingCoherent !== null}
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-60"
          >
            <Translate tid="submissionDetail.markCoherent" />
          </button>
          <button
            type="button"
            onClick={() => handleSetCoherent(false)}
            disabled={settingCoherent !== null}
            className="rounded-md bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700 disabled:opacity-60"
          >
            <Translate tid="submissionDetail.markNotCoherent" />
          </button>
        </div>
      )}

      <h2 className="text-lg font-semibold text-stone-900">
        <Translate tid="submissionDetail.thread" />
      </h2>
      <ul className="mt-4 space-y-3">
        {submission.messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-lg border p-3 ${
              m.senderId === userId
                ? 'ml-8 border-[var(--color-toolme-primary)]/30 bg-[var(--color-toolme-primary)]/5'
                : 'mr-8 border-stone-200 bg-stone-50'
            }`}
          >
            <p className="text-sm text-stone-500">
              {m.senderId === userId ? (
                <Translate tid="submissionDetail.you" />
              ) : (
                <Translate tid="submissionDetail.other" />
              )}{' '}
              · {new Date(m.createdAt).toLocaleString()}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-stone-900">{m.body}</p>
          </li>
        ))}
      </ul>

      {(isLearner || isOwner) && (
        <form onSubmit={handleSendMessage} className="mt-6">
          <label htmlFor="submission-reply" className="sr-only">
            <Translate tid="submissionDetail.reply" />
          </label>
          <textarea
            id="submission-reply"
            rows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-[var(--color-toolme-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-toolme-primary)]"
            disabled={sending}
            placeholder="Reply…"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="mt-2 rounded-md bg-[var(--color-toolme-primary)] px-4 py-2 text-white font-medium hover:bg-[var(--color-toolme-primary-hover)] disabled:opacity-60"
          >
            {sending ? '…' : <Translate tid="submissionDetail.send" />}
          </button>
        </form>
      )}
    </div>
  )
}
