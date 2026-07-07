export type Role = 'user' | 'assistant';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
  attachments?: Attachment[];
}

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
