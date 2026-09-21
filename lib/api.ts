const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_HEALIX_API_URL ?? "http://localhost:8000"

interface ApiErrorPayload {
  detail?: string
}

export interface ApiResponse<T> {
  detail: string
  data: T | null
}

export interface StreamCallbacks {
  onStart?: () => void
  onToken?: (chunk: string) => void
  onDone?: (
    assistant: Message | null,
    chat?: Chat | null
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

export interface Chat {
  chatId: string
  createdAt: string
  updatedAt?: string
  topic?: string
  summary?: string
}

export interface UserProfile {
  userId: string
  name?: string | null
  email?: string | null
  password?: string | null
  gender?: string | null
  globalMemory?: string | null
}

export interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface SendMessageResponse {
  chatId: string
  chat?: Chat | null
  user_message: Message | null
  assistant_message: Message | null
}

export async function signup(
  email: string,
  password: string,
  name?: string
): Promise<ApiResponse<UserProfile>> {
  return apiFetch<ApiResponse<UserProfile>>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  })
}

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<UserProfile>> {
  return apiFetch<ApiResponse<UserProfile>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function listChats(userId: string): Promise<Chat[]> {
  const response = await apiFetch<ApiResponse<{ chats: Chat[]; count: number }>>(
    `/chats?user_id=${userId}`
  )
  return response.data?.chats ?? []
}

export async function createChat(
  topic = "Disease Diagnosis Chat",
  userId: string
): Promise<Chat> {
  const response = await apiFetch<ApiResponse<{ chat: Chat; model_name: string }>>(
    "/chats",
    {
      method: "POST",
      body: JSON.stringify({ topic, user_id: userId }),
    }
  )
  return response.data?.chat || { chatId: "", createdAt: "", updatedAt: "" }
}

export async function getUserProfile(
  userId: string,
  name?: string,
  email?: string
): Promise<UserProfile | null> {
  const params = new URLSearchParams()
  if (name) params.set("name", name)
  if (email) params.set("email", email)
  const suffix = params.toString() ? `?${params.toString()}` : ""
  const response = await apiFetch<ApiResponse<UserProfile>>(
    `/users/${userId}${suffix}`
  )
  return response.data ?? null
}

export async function updateUserProfile(
  userId: string,
  payload: {
    name?: string
    email?: string
    password?: string
    gender?: string
  }
): Promise<UserProfile | null> {
  const response = await apiFetch<ApiResponse<UserProfile>>(
    `/users/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  )
  return response.data ?? null
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
  const response = await apiFetch<ApiResponse<{ userId: string; memory: string }>>(
    `/users/${userId}/memory${suffix}`
  )
  return response.data?.memory ?? ""
}

export async function updateUserGlobalMemory(
  userId: string,
  memory: string
): Promise<string> {
  const response = await apiFetch<ApiResponse<{ userId: string; memory: string }>>(
    `/users/${userId}/memory`,
    {
      method: "PUT",
      body: JSON.stringify({ memory }),
    }
  )
  return response.data?.memory ?? ""
}

export async function deleteChat(
  chatId: string,
  userId: string
): Promise<void> {
  await apiFetch<ApiResponse<{ status: string; chat_id: string }>>(
    `/chats/${chatId}?user_id=${userId}`,
    {
      method: "DELETE",
    }
  )
}

export async function getChatMessages(
  chatId: string,
  userId: string,
  limit = 200
): Promise<Message[]> {
  const response = await apiFetch<ApiResponse<{ messages: Message[]; count: number }>>(
    `/chats/${chatId}/messages?user_id=${userId}&limit=${limit}`
  )
  return response.data?.messages ?? []
}

export async function sendChatMessage(
  chatId: string,
  userId: string,
  content: string
): Promise<SendMessageResponse> {
  const response = await apiFetch<ApiResponse<SendMessageResponse>>(
    `/chats/${chatId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ user_id: userId, content }),
    }
  )
  return response.data || {
    chatId,
    chat: undefined,
    user_message: null,
    assistant_message: null,
  }
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

export async function streamChatMessage(
  chatId: string,
  userId: string,
  content: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const response = await fetch(
    `${BACKEND_BASE_URL}/chats/${chatId}/messages/stream`,
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
          null) as Message | null
        const chat = (parsed.data?.chat ?? null) as Chat | null
        callbacks.onDone?.(assistant, chat)
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
  const response = await apiFetch<ApiResponse<{ status: string; model_type: string; n_diseases: number }>>(
    "/health"
  )
  return response.data || { status: "unknown" }
}
