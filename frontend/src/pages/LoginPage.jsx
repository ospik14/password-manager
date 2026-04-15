import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConsoleInput from '../components/ConsoleInput'
import ExecuteButton from '../components/ExecuteButton'
import TerminalHeading from '../components/TerminalHeading'
import { apiClient } from '../api/client'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: '', masterPassword: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const updateField = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const payload = new URLSearchParams({
        username: formData.username,
        password: formData.masterPassword,
      })
      const response = await apiClient.post('/auth/login', payload)
      localStorage.setItem('token', response.access_token)
      navigate('/vault')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <section className="w-full max-w-xl border border-terminalGreen bg-terminalBlack/90 p-6 shadow-[0_0_24px_rgba(0,255,65,0.25)] md:p-8">
        <TerminalHeading
          title="VaultAPI Access Node"
          subtitle="secure shell authentication required"
        />

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <ConsoleInput
            id="username"
            label="Operator ID"
            value={formData.username}
            onChange={updateField}
            autoComplete="username"
          />
          <ConsoleInput
            id="masterPassword"
            label="Master Key"
            type="password"
            value={formData.masterPassword}
            onChange={updateField}
            autoComplete="current-password"
          />

          {error ? (
            <p className="border border-terminalRed px-3 py-2 text-sm text-terminalRed">
              [ ERROR ] {error}
            </p>
          ) : null}

          <ExecuteButton isLoading={isLoading} />
        </form>
      </section>
    </main>
  )
}

export default LoginPage
