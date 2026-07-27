const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_HEALIX_API_URL ?? "http://localhost:8000"

interface ApiErrorPayload {
  detail?: string
}

export interface StreamCallbacks {
  onStart?: () => void
  onToken?: (chunk: string) => void
  onDone?: (assistant: BackendMessage | null) => void
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
  user_message: BackendMessage | null
  assistant_message: BackendMessage | null
}

export async function listSessions(): Promise<BackendSession[]> {
  const data = await apiFetch<SessionsResponse>("/sessions")
  return data.sessions
}

export async function createSession(
  topic = "Disease Diagnosis Chat"
): Promise<BackendSession> {
  const data = await apiFetch<CreateSessionResponse>("/sessions", {
    method: "POST",
    body: JSON.stringify({ topic }),
  })
  return data.session
}

export async function deleteSession(sessionId: string): Promise<void> {
  await apiFetch(`/sessions/${sessionId}`, {
    method: "DELETE",
  })
}

export async function getSessionMessages(
  sessionId: string,
  limit = 200
): Promise<BackendMessage[]> {
  const data = await apiFetch<MessagesResponse>(
    `/sessions/${sessionId}/messages?limit=${limit}`
  )
  return data.messages
}

export async function sendSessionMessage(
  sessionId: string,
  content: string
): Promise<SendMessageResponse> {
  return apiFetch<SendMessageResponse>(`/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
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
  content: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/sessions/${sessionId}/messages/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  })

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
        const assistant = (parsed.data?.assistant_message ?? null) as BackendMessage | null
        callbacks.onDone?.(assistant)
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
