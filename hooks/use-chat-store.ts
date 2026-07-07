import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chat, Message, User, Attachment } from '@/lib/types';
import { initialChats, mockUser, generateMockAIResponse } from '@/lib/mock-data';

interface ChatState {
  user: User | null;
  chats: Chat[];
  activeChatId: string | null;
  isTyping: boolean;
  sidebarExpanded: boolean;
  
  login: () => void;
  logout: () => void;
  setActiveChatId: (id: string | null) => void;
  createNewChat: () => string;
  deleteChat: (id: string) => void;
  sendMessage: (chatId: string, content: string, attachments?: Attachment[]) => void;
  setSidebarExpanded: (expanded: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      user: null,
      chats: initialChats,
      activeChatId: null,
      isTyping: false,
      sidebarExpanded: true,

      login: () => set({ user: mockUser }),
      
      logout: () => set({ user: null, activeChatId: null }),
      
      setActiveChatId: (id) => set({ activeChatId: id }),
      
      createNewChat: () => {
        const newChat: Chat = {
          id: `chat-${Date.now()}`,
          title: 'New Conversation',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
        };
        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChatId: newChat.id,
        }));
        return newChat.id;
      },
      
      deleteChat: (id) => set((state) => ({
        chats: state.chats.filter(c => c.id !== id),
        activeChatId: state.activeChatId === id ? null : state.activeChatId
      })),
      
      sendMessage: (chatId, content, attachments) => {
        const userMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'user',
          content,
          createdAt: new Date(),
          attachments,
        };

        set((state) => ({
          isTyping: true,
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              const title = chat.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : chat.title;
              return {
                ...chat,
                title,
                updatedAt: new Date(),
                messages: [...chat.messages, userMessage]
              };
            }
            return chat;
          })
        }));

        // Simulate AI response delay
        setTimeout(() => {
          const aiResponseContent = generateMockAIResponse(content);
          const aiMessage: Message = {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content: aiResponseContent,
            createdAt: new Date(),
          };

          set((state) => ({
            isTyping: false,
            chats: state.chats.map(chat => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  updatedAt: new Date(),
                  messages: [...chat.messages, aiMessage]
                };
              }
              return chat;
            })
          }));
        }, 1500);
      },
      
      setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
    }),
    {
      name: 'healix-storage',
      partialize: (state) => ({ 
        user: state.user,
        sidebarExpanded: state.sidebarExpanded
        // We do not persist chats in this demo, but we could by adding 'chats' to this array.
      }),
    }
  )
);
