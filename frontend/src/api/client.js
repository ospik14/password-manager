const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const isFormData =
    options.body instanceof URLSearchParams || options.body instanceof FormData

  const headers = isFormData
    ? { ...(options.headers || {}) }
    : {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    credentials: 'include',
    ...options,
  })

  let payload = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    payload = await response.json()
  } else {
    payload = await response.text()
  }

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.detail || payload?.message || 'Request failed'

    throw new Error(message)
  }

  return payload
}

export const apiClient = {
  getAuthHeaders,
  get: (path, options = {}) => request(path, { method: 'GET', ...options }),
  post: (path, body, options = {}) =>
    request(path, {
      method: 'POST',
      body:
        body instanceof URLSearchParams || body instanceof FormData
          ? body
          : JSON.stringify(body),
      ...options,
    }),
  patch: (path, body, options = {}) =>
    request(path, {
      method: 'PATCH',
      body:
        body instanceof URLSearchParams || body instanceof FormData
          ? body
          : JSON.stringify(body),
      ...options,
    }),
}
