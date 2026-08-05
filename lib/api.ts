const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_HEALIX_API_URL ?? "http://localhost:8000"

interface ApiErrorPayload {
  detail?: string
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
  chat_id: string
  created_at: string
  updated_at?: string
  topic?: string
  summary?: string
}

export interface UserProfile {
  user_id: string
  name?: string | null
  email?: string | null
  password?: string | null
  gender?: string | null
  avatarUrl?: string | null
  global_memory?: string | null
  settings?: Record<string, string | number | boolean | null>
}

export interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface ChatsResponse {
  chats: Chat[]
  count: number
}

interface CreateChatResponse {
  chat: Chat
  model_name: string
}

interface MessagesResponse {
  messages: Message[]
  count: number
}

interface SendMessageResponse {
  chat_id: string
  chat?: Chat | null
  user_message: Message | null
  assistant_message: Message | null
}

interface UserProfileResponse {
  profile: UserProfile | null
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

export async function listChats(userId: string): Promise<Chat[]> {
  const encodedUserId = encodeURIComponent(userId)
  const data = await apiFetch<ChatsResponse>(
    `/chats?user_id=${encodedUserId}`
  )
  return data.chats
}

export async function createChat(
  topic = "Disease Diagnosis Chat",
  userId: string
): Promise<Chat> {
  const data = await apiFetch<CreateChatResponse>("/chats", {
    method: "POST",
    body: JSON.stringify({ topic, user_id: userId }),
  })
  return data.chat
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
): Promise<UserProfile | null> {
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

export async function deleteChat(
  chatId: string,
  userId: string
): Promise<void> {
  const encodedUserId = encodeURIComponent(userId)
  await apiFetch(`/chats/${chatId}?user_id=${encodedUserId}`, {
    method: "DELETE",
  })
}

export async function getChatMessages(
  chatId: string,
  userId: string,
  limit = 200
): Promise<Message[]> {
  const encodedUserId = encodeURIComponent(userId)
  const data = await apiFetch<MessagesResponse>(
    `/chats/${chatId}/messages?user_id=${encodedUserId}&limit=${limit}`
  )
  return data.messages
}

export async function getChatMemory(
  chatId: string,
  userId: string
): Promise<string> {
  const encodedUserId = encodeURIComponent(userId)
  const data = await apiFetch<MemoryResponse>(
    `/chats/${chatId}/memory?user_id=${encodedUserId}`
  )
  return data.memory ?? ""
}

export async function updateChatMemory(
  chatId: string,
  userId: string,
  memory: string
): Promise<string> {
  const encodedUserId = encodeURIComponent(userId)
  const data = await apiFetch<MemoryResponse>(
    `/chats/${chatId}/memory?user_id=${encodedUserId}`,
    {
      method: "PUT",
      body: JSON.stringify({ memory }),
    }
  )
  return data.memory ?? ""
}

export async function sendChatMessage(
  chatId: string,
  userId: string,
  content: string
): Promise<SendMessageResponse> {
  return apiFetch<SendMessageResponse>(`/chats/${chatId}/messages`, {
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
  return apiFetch<{ status: string }>("/health")
}
