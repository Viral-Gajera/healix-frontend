const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_HEALIX_API_URL ?? "http://localhost:8000"

interface ApiErrorPayload {
  detail?: string
}

export interface StreamCallbacks {
  onStart?: () => void
  onToken?: (chunk: string) => void
  onDone?: (
    assistant: BackendMessage | null,
    session?: BackendSession | null
  ) => void
  onError?: (message: string) => void
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const payload = (await response.json()) as ApiErrorPayload
      if (payload?.detail) {
        message = payload.detail
      }
    } catch {
      // Keep fallback message if error payload is not JSON.
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}

export interface BackendSession {
  session_id: string
  created_at: string
  updated_at?: string
  topic?: string
  summary?: string
}

export interface BackendUserProfile {
  user_id: string
  name?: string | null
  email?: string | null
  password?: string | null
  gender?: string | null
  global_memory?: string | null
  settings?: Record<string, string | number | boolean | null>
}

export interface BackendMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface SessionsResponse {
  sessions: BackendSession[]
  count: number
}

interface CreateSessionResponse {
  session: BackendSession
  model_name: string
}

interface MessagesResponse {
  messages: BackendMessage[]
  count: number
}

interface SendMessageResponse {
  session_id: string
  session?: BackendSession | null
  user_message: BackendMessage | null
  assistant_message: BackendMessage | null
}

interface UserProfileResponse {
  profile: BackendUserProfile | null
}

interface MemoryResponse {
  memory: string
}

interface AuthResponse {
  user_id: string
  name: string
  email: string
  message: string
}

export async function signup(
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  })
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function listSessions(userId: string): Promise<BackendSession[]> {
  const encodedUserId = encodeURIComponent(userId)
  const data = await apiFetch<SessionsResponse>(
    `/sessions?user_id=${encodedUserId}`
  )
  return data.sessions
}

export async function createSession(
  topic = "Disease Diagnosis Chat",
  userId: string
): Promise<BackendSession> {
  const data = await apiFetch<CreateSessionResponse>("/sessions", {
    method: "POST",
    body: JSON.stringify({ topic, user_id: userId }),
  })
  return data.session
}

export async function getUserProfile(
  userId: string,
  name?: string,
  email?: string
): Promise<BackendUserProfile | null> {
  const params = new URLSearchParams()
  if (name) params.set("name", name)
  if (email) params.set("email", email)
  const suffix = params.toString() ? `?${params.toString()}` : ""
  const data = await apiFetch<UserProfileResponse>(
    `/users/${encodeURIComponent(userId)}${suffix}`
  )
  return data.profile
}

export async function updateUserProfile(
  userId: string,
  payload: {
    name?: string
    email?: string
    password?: string
    gender?: string
    settings?: Record<string, string | number | boolean | null>
  }
): Promise<BackendUserProfile | null> {
  const data = await apiFetch<UserProfileResponse>(
    `/users/${encodeURIComponent(userId)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  )
  return data.profile
}

export async function getUserGlobalMemory(
  userId: string,
  name?: string,
  email?: string
): Promise<string> {
  const params = new URLSearchParams()
  if (name) params.set("name", name)
  if (email) params.set("email", email)
  const suffix = params.toString() ? `?${params.toString()}` : ""
  const data = await apiFetch<MemoryResponse>(
    `/users/${encodeURIComponent(userId)}/memory${suffix}`
  )
  return data.memory ?? ""
}

export async function updateUserGlobalMemory(
  userId: string,
  memory: string
): Promise<string> {
  const data = await apiFetch<MemoryResponse>(
    `/users/${encodeURIComponent(userId)}/memory`,
    {
      method: "PUT",
      body: JSON.stringify({ memory }),
    }
  )
  return data.memory ?? ""
}

export async function deleteSession(
  sessionId: string,
  userId: string
): Promise<void> {
  const encodedUserId = encodeURIComponent(userId)
  await apiFetch(`/sessions/${sessionId}?user_id=${encodedUserId}`, {
    method: "DELETE",
  })
}

export async function getSessionMessages(
  sessionId: string,
  userId: string,
  limit = 200
): Promise<BackendMessage[]> {
  const encodedUserId = encodeURIComponent(userId)
  const data = await apiFetch<MessagesResponse>(
    `/sessions/${sessionId}/messages?user_id=${encodedUserId}&limit=${limit}`
  )
  return data.messages
}

export async function getSessionMemory(
  sessionId: string,
  userId: string
): Promise<string> {
  const encodedUserId = encodeURIComponent(userId)
  const data = await apiFetch<MemoryResponse>(
    `/sessions/${sessionId}/memory?user_id=${encodedUserId}`
  )
  return data.memory ?? ""
}

export async function updateSessionMemory(
  sessionId: string,
  userId: string,
  memory: string
): Promise<string> {
  const encodedUserId = encodeURIComponent(userId)
  const data = await apiFetch<MemoryResponse>(
    `/sessions/${sessionId}/memory?user_id=${encodedUserId}`,
    {
      method: "PUT",
      body: JSON.stringify({ memory }),
    }
  )
  return data.memory ?? ""
}

export async function sendSessionMessage(
  sessionId: string,
  userId: string,
  content: string
): Promise<SendMessageResponse> {
  return apiFetch<SendMessageResponse>(`/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, content }),
  })
}

function parseSseEvent(
  rawEvent: string
): { event: string; data: Record<string, unknown> | null } | null {
  const lines = rawEvent.split("\n")
  let event = "message"
  let dataLine = ""

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim()
    }
    if (line.startsWith("data:")) {
      dataLine += line.slice(5).trim()
    }
  }

  if (!dataLine) {
    return null
  }

  try {
    return { event, data: JSON.parse(dataLine) as Record<string, unknown> }
  } catch {
    return null
  }
}

export async function streamSessionMessage(
  sessionId: string,
  userId: string,
  content: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const response = await fetch(
    `${BACKEND_BASE_URL}/sessions/${sessionId}/messages/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId, content }),
    }
  )

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const payload = (await response.json()) as ApiErrorPayload
      if (payload?.detail) {
        message = payload.detail
      }
    } catch {
      // Keep fallback message.
    }
    throw new Error(message)
  }

  if (!response.body) {
    throw new Error("Streaming response body is unavailable")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder("utf-8")
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split("\n\n")
    buffer = events.pop() ?? ""

    for (const eventChunk of events) {
      const parsed = parseSseEvent(eventChunk)
      if (!parsed) {
        continue
      }

      if (parsed.event === "start") {
        callbacks.onStart?.()
      }

      if (parsed.event === "token") {
        const token = parsed.data?.content
        if (typeof token === "string") {
          callbacks.onToken?.(token)
        }
      }

      if (parsed.event === "done") {
        const assistant = (parsed.data?.assistant_message ??
          null) as BackendMessage | null
        const session = (parsed.data?.session ?? null) as BackendSession | null
        callbacks.onDone?.(assistant, session)
      }

      if (parsed.event === "error") {
        const detail = parsed.data?.detail
        callbacks.onError?.(
          typeof detail === "string" ? detail : "Streaming failed unexpectedly"
        )
      }
    }
  }
}

export async function checkHealth(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/health")
}
