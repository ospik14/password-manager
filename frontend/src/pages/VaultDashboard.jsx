import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BlinkingCursor from '../components/BlinkingCursor'
import { apiClient } from '../api/client'
import './vault_styles.css'

const SCRAMBLE_CHARS = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*@!?'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const scrambleTextFrame = (length) =>
  Array.from(
    { length },
    () => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
  ).join('')

function VaultDashboard() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [decryptingId, setDecryptingId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [revealedPasswords, setRevealedPasswords] = useState({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [saveScrambleText, setSaveScrambleText] = useState('')
  const [leakWarning, setLeakWarning] = useState('')
  const [createForm, setCreateForm] = useState({
    title: '',
    login: '',
    password: '',
    url: '',
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

  const isPasswordLeakError = (requestError) =>
    requestError?.status === 400 &&
    (requestError?.code === 'PASSWORD_LEAK_DETECTED' ||
      requestError?.code === 'PWNED_PASSWORD!' ||
      requestError?.message === 'PASSWORD_LEAK_DETECTED' ||
      requestError?.message === 'PWNED_PASSWORD!')

  const submitCreate = async (forceSave) => {
    if (!createForm.title || !createForm.login || !createForm.password) {
      setError('Title, Login and Password are required.')
      return
    }
    setError('')
    setLeakWarning('')
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
          force_save: forceSave,
        },
        {  
          headers: { 
            ...headers, 
            'Content-Type': 'application/json' 
          } 
        }, 
      )
      await loadRecords()
      setSaveScrambleText('[ ENCRYPTING PAYLOAD ]')
      for (let frame = 0; frame < 4; frame += 1) {
        setSaveScrambleText(scrambleTextFrame(24))
        await wait(70)
      }
      setSaveScrambleText('[ DOSSIER SEALED ]')
      await wait(160)
      setIsCreateOpen(false)
      setSaveScrambleText('')
      setCreateForm({
        title: '',
        login: '',
        password: '',
        url: '',
      })
    } catch (requestError) {
      if (requestError.message === 'Incorrect login or password!') {
        handleLogout()
        return
      }
      if (isPasswordLeakError(requestError) && !forceSave) {
        setLeakWarning(
          requestError.serverMessage ||
            'This password was found in known leaks. Ignore and save anyway?',
        )
        return
      }
      setError(requestError.message)
    } finally {
      setCreating(false)
    }
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    await submitCreate(false)
  }

  const handleForceSave = async () => {
    await submitCreate(true)
  }

  const updateCreateField = (event) => {
    const { name, value } = event.target
    setCreateForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCopy = async (recordId) => {
    const target = records.find((item) => item.id === recordId)
    if (!target?.password) {
      return
    }

    try {
      await navigator.clipboard.writeText(target.password)
    } catch {
      setError('Clipboard unavailable for this browser context.')
    }
  }

  const duplicatePasswordCount = useMemo(() => {
    const counts = records.reduce((acc, item) => {
      if (!item.password) {
        return acc
      }
      acc[item.password] = (acc[item.password] || 0) + 1
      return acc
    }, {})
    return Object.values(counts).filter((value) => value > 1).length
  }, [records])

  const threatLevel = Math.min(95, 35 + duplicatePasswordCount * 15 + records.length * 2)
  const gridRecords = records.slice(0, 9)
  const netLogs = records
    .slice(0, 6)
    .map((record, index) => `[${String(index + 1).padStart(2, '0')}] sync/${record.title} ok`)
    .reverse()

  return (
    <main className="min-h-screen bg-[#0A0E17] px-4 py-6 font-['Space_Grotesk'] text-[#00E5FF] md:px-8">
      <section className="dossier-grid mx-auto w-full max-w-7xl rounded-md border border-[#00E5FF]/20 bg-[#1A1F2B]/65 p-4 shadow-xl backdrop-blur-md md:p-6">
        <header className="flex flex-col gap-4 rounded-sm border border-[#00E5FF]/20 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
          <h1 className="font-mono text-lg uppercase tracking-[0.18em] md:text-xl">
            {'>_ SYS_ADMIN '}
            <BlinkingCursor />
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-sm border border-[#00E5FF]/60 bg-[#0055FF]/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-[#00E5FF] transition hover:shadow-[0_0_18px_rgba(0,85,255,0.4)]"
          >
            [ LOGOUT ]
          </button>
        </header>

        <section className="mt-4">
          <button
            type="button"
            onClick={() => {
              setLeakWarning('')
              setIsCreateOpen(true)
            }}
            disabled={creating}
            className="w-full rounded-sm border border-[#0055FF]/70 bg-[#0055FF]/20 px-4 py-3 font-mono text-sm uppercase tracking-[0.18em] text-[#00E5FF] transition hover:shadow-[0_0_24px_rgba(0,85,255,0.45)] disabled:opacity-60"
          >
            {creating ? '[ INJECTING... ]' : '[ + INJECT NEW RECORD ]'}
          </button>
        </section>

        {error ? (
          <p className="mt-4 rounded-sm border border-[#FF3366]/60 bg-[#FF3366]/10 px-3 py-2 font-mono text-sm text-[#FF3366]">
            [ ERROR ] {error}
          </p>
        ) : null}

        <section className="mt-4 grid gap-4 xl:grid-cols-[2.1fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              <p className="rounded-sm border border-[#00E5FF]/30 bg-black/20 p-4 font-mono text-sm text-[#00E5FF]/80 sm:col-span-2 xl:col-span-3">
                LOADING RECORDS...
              </p>
            ) : null}
            {!isLoading && gridRecords.length === 0 ? (
              <p className="rounded-sm border border-[#00E5FF]/30 bg-black/20 p-4 font-mono text-sm text-[#00E5FF]/80 sm:col-span-2 xl:col-span-3">
                NO RECORDS IN VAULT.
              </p>
            ) : null}
            {!isLoading
              ? gridRecords.map((record) => (
                  <article
                    key={record.id}
                    className="dossier-card rounded-sm bg-[#1A1F2B]/85 p-4 backdrop-blur-sm"
                  >
                    <div className="mb-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(record.id)}
                        className="rounded-sm border border-[#0055FF]/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#00E5FF] transition hover:bg-[#0055FF]/20"
                        title="Copy password"
                      >
                        [COPY]
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecrypt(record.id)}
                        disabled={decryptingId === record.id}
                        className="rounded-sm border border-[#0055FF]/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#00E5FF] transition hover:bg-[#0055FF]/20 disabled:opacity-50"
                        title="Reveal password"
                      >
                        [VIEW]
                      </button>
                      <button
                        type="button"
                        className="rounded-sm border border-[#0055FF]/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#00E5FF]/60"
                        title="Edit (visual placeholder)"
                      >
                        [EDIT]
                      </button>
                    </div>

                    <div className="space-y-2 font-mono text-xs text-[#00E5FF]/90">
                      <p>
                        <span className="text-[#00E5FF]/60">TITLE:</span> {record.title}
                      </p>
                      <p>
                        <span className="text-[#00E5FF]/60">LOGIN:</span> {record.login}
                      </p>
                      <p className="truncate">
                        <span className="text-[#00E5FF]/60">URL:</span> {record.url || '-'}
                      </p>
                      <p>
                        <span className="text-[#00E5FF]/60">PASS:</span>
                      </p>
                      <span className="password-redacted block rounded-sm border border-[#00E5FF]/20 bg-black px-2 py-1 font-mono text-[#00E5FF]">
                        {revealedPasswords[record.id] ? record.password : '████████████'}
                      </span>
                    </div>
                  </article>
                ))
              : null}
          </div>

          <aside className="rounded-sm border border-[#00E5FF]/20 bg-[#1A1F2B]/80 p-4 backdrop-blur-sm">
            <h3 className="font-mono text-sm uppercase tracking-[0.14em] text-[#00E5FF]">
              OSINT Dashboard
            </h3>

            <div className="mt-4 rounded-sm border border-[#FF3366]/45 bg-black/25 p-3">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#FF3366]">
                Threat Level
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="osint-arc relative h-16 w-16 rounded-full p-1">
                  <div className="h-full w-full rounded-full bg-[#1A1F2B]" />
                </div>
                <div>
                  <p className="font-mono text-2xl text-[#FF3366]">{threatLevel}%</p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#FF3366]/80">
                    Elevated risk
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-sm border border-[#FF3366]/35 bg-black/25 p-3">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#FF3366]">
                THREAT MAP
              </p>
              <div className="mt-3 space-y-2 font-mono text-[11px] text-[#FF3366]/85">
                <div className="h-[2px] w-full bg-[#FF3366]/60" />
                <p>{`Duplicate password clusters: ${duplicatePasswordCount}`}</p>
                <p>{`Nodes scanned: ${records.length}`}</p>
                <div className="h-[2px] w-3/4 bg-[#FF3366]/40" />
              </div>
            </div>

            <div className="mt-4 rounded-sm border border-[#00E5FF]/30 bg-black/25 p-3">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#00E5FF]">
                NET LOGS
              </p>
              <div className="mt-2 max-h-40 space-y-1 overflow-hidden font-mono text-[11px] text-[#00E5FF]/75">
                {netLogs.length
                  ? netLogs.map((entry) => <p key={entry}>{entry}</p>)
                  : '[00] waiting/network'}
              </div>
            </div>
          </aside>
        </section>
      </section>
      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0E17]/90 p-4 backdrop-blur-sm">
          <section className="w-full max-w-2xl rounded-sm border border-[#00E5FF]/35 bg-[#1A1F2B]/85 p-5 shadow-2xl backdrop-blur-md md:p-6">
            <header className="mb-4 rounded-sm border border-[#00E5FF]/20 bg-black/30 p-3">
              <h2 className="font-mono text-sm uppercase tracking-[0.16em] text-[#00E5FF] md:text-base">
                {'>_ INJECT NEW RECORD '}
                <BlinkingCursor />
              </h2>
            </header>

            <form className="space-y-4" onSubmit={handleCreate}>
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-[#00E5FF]/80">
                  Title
                </span>
                <input
                  name="title"
                  value={createForm.title}
                  onChange={updateCreateField}
                  className="w-full rounded-sm border border-[#00E5FF]/30 bg-black/40 px-3 py-2 text-sm text-[#00E5FF] outline-none focus:border-[#0055FF]"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-[#00E5FF]/80">
                  Login
                </span>
                <input
                  name="login"
                  value={createForm.login}
                  onChange={updateCreateField}
                  className="w-full rounded-sm border border-[#00E5FF]/30 bg-black/40 px-3 py-2 font-mono text-sm text-[#00E5FF] outline-none focus:border-[#0055FF]"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-[#00E5FF]/80">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  value={createForm.password}
                  onChange={updateCreateField}
                  className="w-full rounded-sm border border-[#00E5FF]/30 bg-black/40 px-3 py-2 font-mono text-sm text-[#00E5FF] outline-none focus:border-[#0055FF]"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-[#00E5FF]/80">
                  URL (optional)
                </span>
                <input
                  name="url"
                  value={createForm.url}
                  onChange={updateCreateField}
                  className="w-full rounded-sm border border-[#00E5FF]/30 bg-black/40 px-3 py-2 font-mono text-sm text-[#00E5FF] outline-none focus:border-[#0055FF]"
                />
              </label>

              <div className="flex flex-col gap-3 md:flex-row">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-sm border border-[#0055FF]/70 bg-[#0055FF]/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-[#00E5FF] transition hover:shadow-[0_0_18px_rgba(0,85,255,0.4)] disabled:opacity-50"
                >
                  {creating ? '[ INJECTING... ]' : '[ EXECUTE INJECT ]'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setLeakWarning('')
                  }}
                  className="rounded-sm border border-[#00E5FF]/35 bg-black/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-[#00E5FF] transition hover:bg-black/30"
                >
                  [ CANCEL ]
                </button>
              </div>
              {leakWarning ? (
                <div className="rounded-sm border border-[#FF3366]/50 bg-[#FF3366]/10 p-3">
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#FF3366]">
                    [ LEAK WARNING ]
                  </p>
                  <p className="mt-2 font-mono text-xs text-[#FF3366]/90">{leakWarning}</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleForceSave}
                      disabled={creating}
                      className="rounded-sm border border-[#FF3366]/60 bg-[#FF3366]/15 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-[#FF3366] transition hover:bg-[#FF3366]/20 disabled:opacity-50"
                    >
                      [ IGNORE & SAVE ]
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeakWarning('')}
                      className="rounded-sm border border-[#00E5FF]/35 bg-black/20 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-[#00E5FF] transition hover:bg-black/30"
                    >
                      [ OK, CHANGE PASSWORD ]
                    </button>
                  </div>
                </div>
              ) : null}
              {saveScrambleText ? (
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#00E5FF]/80">
                  {saveScrambleText}
                </p>
              ) : null}
            </form>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default VaultDashboard
