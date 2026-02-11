import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Translate } from './Translate'
import { useAuth } from '../context/useAuth'
import { deleteAccount } from '../api/auth'

/**
 * Danger zone: delete account with password + "DELETE" confirmation.
 */
export function DeleteAccountSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  return (
    <section className="mt-10 pt-8 border-t border-stone-200" aria-labelledby="danger-heading">
      <h2 id="danger-heading" className="text-lg font-semibold text-stone-900">
        <Translate tid="account.dangerZone" />
      </h2>
      <p className="mt-2 text-sm text-stone-600">
        <Translate tid="account.deleteDescription" />
      </p>
      {deleteError && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-red-800 text-sm" role="alert">
          {deleteError.startsWith('account.') ? <Translate tid={deleteError} /> : deleteError}
        </div>
      )}
      <div className="mt-4 flex flex-col gap-3 max-w-xs">
        <input
          type="password"
          placeholder={t('account.deletePasswordPlaceholder')}
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          className="block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          disabled={deleting}
          aria-label="Password to confirm account deletion"
        />
        <input
          type="text"
          placeholder={t('account.deleteConfirmPlaceholder')}
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          className="block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          disabled={deleting}
          aria-label="Type DELETE to confirm"
        />
        <button
          type="button"
          disabled={deleting || deleteConfirm !== 'DELETE'}
          onClick={() => {
            setDeleteError(null)
            setDeleting(true)
            deleteAccount(deletePassword)
              .then(() => logout())
              .then(() => navigate('/', { replace: true }))
              .catch((err) => {
                setDeleteError(err instanceof Error ? err.message : 'account.deleteError')
              })
              .finally(() => setDeleting(false))
          }}
          className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Translate tid="account.deleteAccount" />
        </button>
      </div>
    </section>
  )
}
