import { Link } from 'react-router-dom'
import { Translate } from './Translate'

type ProjectOwnerActionsProps = Readonly<{
  projectId: string
  onDelete: () => void
  deleting?: boolean
}>

export function ProjectOwnerActions({
  projectId,
  onDelete,
  deleting = false,
}: ProjectOwnerActionsProps) {
  return (
    <>
      <Link
        to={`/project/${projectId}/edit`}
        className="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-5 py-2.5 text-stone-700 font-medium hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toolme-primary)] focus-visible:ring-offset-2"
      >
        <Translate tid="projectDetail.edit" />
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="inline-flex items-center justify-center rounded-md border border-red-200 bg-white px-5 py-2.5 text-red-700 font-medium hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-60"
      >
        {deleting ? '…' : <Translate tid="projectDetail.delete" />}
      </button>
    </>
  )
}
