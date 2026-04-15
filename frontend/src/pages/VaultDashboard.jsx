import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BlinkingCursor from '../components/BlinkingCursor'
import { apiClient } from '../api/client'

function VaultDashboard() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [decryptingId, setDecryptingId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [revealedPasswords, setRevealedPasswords] = useState({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    login: '',
    password: '',
    url: '',
    forceSave: false,
  })

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    navigate('/login')
  }, [navigate])

  const loadRecords = useCallback(async () => {
    setError('')
    setIsLoading(true)

    try {
      const headers = apiClient.getAuthHeaders()
      const summaryItems = await apiClient.get('/vault/api/items/', { headers })
      const fullItems = await Promise.all(
        summaryItems.map((item) =>
          apiClient.get(`/vault/api/items/${item.id}`, { headers }),
        ),
      )

      setRecords(fullItems)
    } catch (requestError) {
      if (requestError.message === 'Incorrect login or password!') {
        handleLogout()
        return
      }
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }, [handleLogout])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const handleDecrypt = async (recordId) => {
    setError('')
    setDecryptingId(recordId)

    try {
      const headers = apiClient.getAuthHeaders()
      const record = await apiClient.get(`/vault/api/items/${recordId}`, { headers })
      setRecords((prev) =>
        prev.map((item) => (item.id === recordId ? record : item)),
      )
      setRevealedPasswords((prev) => ({ ...prev, [recordId]: true }))
    } catch (requestError) {
      if (requestError.message === 'Incorrect login or password!') {
        handleLogout()
        return
      }
      setError(requestError.message)
    } finally {
      setDecryptingId(null)
    }
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!createForm.title || !createForm.login || !createForm.password) {
      setError('Title, Login and Password are required.')
      return
    }
    setError('')
    setCreating(true)

    try {
      const headers = apiClient.getAuthHeaders()
      await apiClient.post(
        '/vault/api/items/',
        {
          title: createForm.title,
          login: createForm.login,
          password: createForm.password,
          url: createForm.url || null,
          force_save: createForm.forceSave,
        },
        { headers },
      )
      await loadRecords()
      setIsCreateOpen(false)
      setCreateForm({
        title: '',
        login: '',
        password: '',
        url: '',
        forceSave: false,
      })
    } catch (requestError) {
      if (requestError.message === 'Incorrect login or password!') {
        handleLogout()
        return
      }
      setError(requestError.message)
    } finally {
      setCreating(false)
    }
  }

  const updateCreateField = (event) => {
    const { name, type, checked, value } = event.target
    setCreateForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <main className="min-h-screen bg-terminalBlack px-4 py-6 text-terminalGreen md:px-8">
      <section className="mx-auto w-full max-w-5xl border border-terminalGreen p-4 md:p-6">
        <header className="flex flex-col gap-4 border border-terminalGreen p-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-lg uppercase tracking-[0.18em] md:text-xl">
            {'>_ SYS_ADMIN '}
            <BlinkingCursor />
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="border border-terminalGreen px-4 py-2 text-xs uppercase tracking-[0.16em] transition hover:bg-terminalGreen hover:text-terminalBlack"
          >
            [ LOGOUT ]
          </button>
        </header>

        <section className="mt-4 border border-terminalGreen p-4">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            disabled={creating}
            className="w-full border border-terminalGreen px-4 py-3 text-sm uppercase tracking-[0.16em] transition hover:bg-terminalGreen hover:text-terminalBlack"
          >
            {creating ? '[ INJECTING... ]' : '[ + INJECT NEW RECORD ]'}
          </button>
        </section>

        <section className="mt-4 border border-terminalGreen p-4">
          {error ? (
            <p className="mb-4 border border-terminalRed px-3 py-2 text-sm text-terminalRed">
              [ ERROR ] {error}
            </p>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="border border-terminalGreen px-3 py-2 uppercase tracking-[0.12em]">
                    Title
                  </th>
                  <th className="border border-terminalGreen px-3 py-2 uppercase tracking-[0.12em]">
                    Login
                  </th>
                  <th className="border border-terminalGreen px-3 py-2 uppercase tracking-[0.12em]">
                    URL
                  </th>
                  <th className="border border-terminalGreen px-3 py-2 uppercase tracking-[0.12em]">
                    Password
                  </th>
                  <th className="border border-terminalGreen px-3 py-2 uppercase tracking-[0.12em]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      className="border border-terminalGreen px-3 py-4 text-terminalGreen/80"
                      colSpan={5}
                    >
                      LOADING RECORDS...
                    </td>
                  </tr>
                ) : null}
                {!isLoading && records.length === 0 ? (
                  <tr>
                    <td
                      className="border border-terminalGreen px-3 py-4 text-terminalGreen/80"
                      colSpan={5}
                    >
                      NO RECORDS IN VAULT.
                    </td>
                  </tr>
                ) : null}
                {!isLoading
                  ? records.map((record) => (
                      <tr key={record.id}>
                        <td className="border border-terminalGreen px-3 py-2">
                          {record.title}
                        </td>
                        <td className="border border-terminalGreen px-3 py-2">
                          {record.login}
                        </td>
                        <td className="border border-terminalGreen px-3 py-2">
                          {record.url || '-'}
                        </td>
                        <td className="border border-terminalGreen px-3 py-2">
                          {revealedPasswords[record.id] ? record.password : '********'}
                        </td>
                        <td className="border border-terminalGreen px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleDecrypt(record.id)}
                            disabled={decryptingId === record.id}
                            className="border border-terminalGreen px-3 py-1 text-xs uppercase tracking-[0.12em] transition hover:bg-terminalGreen hover:text-terminalBlack disabled:opacity-50"
                          >
                            {decryptingId === record.id ? '[ DECRYPTING... ]' : '[ DECRYPT ]'}
                          </button>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-terminalBlack/95 p-4">
          <section className="w-full max-w-2xl border border-terminalGreen bg-terminalBlack p-5 md:p-6">
            <header className="mb-4 border border-terminalGreen p-3">
              <h2 className="text-sm uppercase tracking-[0.16em] md:text-base">
                {'>_ INJECT NEW RECORD '}
                <BlinkingCursor />
              </h2>
            </header>

            <form className="space-y-4" onSubmit={handleCreate}>
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.12em]">
                  Title
                </span>
                <input
                  name="title"
                  value={createForm.title}
                  onChange={updateCreateField}
                  className="w-full border border-terminalGreen bg-transparent px-3 py-2 text-sm outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.12em]">
                  Login
                </span>
                <input
                  name="login"
                  value={createForm.login}
                  onChange={updateCreateField}
                  className="w-full border border-terminalGreen bg-transparent px-3 py-2 text-sm outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.12em]">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  value={createForm.password}
                  onChange={updateCreateField}
                  className="w-full border border-terminalGreen bg-transparent px-3 py-2 text-sm outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.12em]">
                  URL (optional)
                </span>
                <input
                  name="url"
                  value={createForm.url}
                  onChange={updateCreateField}
                  className="w-full border border-terminalGreen bg-transparent px-3 py-2 text-sm outline-none"
                />
              </label>

              <label className="flex items-center gap-2 border border-terminalGreen px-3 py-2 text-xs uppercase tracking-[0.12em]">
                <input
                  type="checkbox"
                  name="forceSave"
                  checked={createForm.forceSave}
                  onChange={updateCreateField}
                  className="h-4 w-4 accent-terminalGreen"
                />
                Force save if password leaked
              </label>

              <div className="flex flex-col gap-3 md:flex-row">
                <button
                  type="submit"
                  disabled={creating}
                  className="border border-terminalGreen px-4 py-2 text-xs uppercase tracking-[0.16em] transition hover:bg-terminalGreen hover:text-terminalBlack disabled:opacity-50"
                >
                  {creating ? '[ INJECTING... ]' : '[ EXECUTE INJECT ]'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="border border-terminalGreen px-4 py-2 text-xs uppercase tracking-[0.16em] transition hover:bg-terminalGreen hover:text-terminalBlack"
                >
                  [ CANCEL ]
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default VaultDashboard
