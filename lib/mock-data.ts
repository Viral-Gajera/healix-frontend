import { Chat, User } from './types';

export const mockUser: User = {
  id: 'user-1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  avatarUrl: 'https://i.pravatar.cc/150?u=jane',
};

export const initialChats: Chat[] = [
  {
    id: 'chat-1',
    title: 'General Health Inquiry',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Hi Healix, what are some common symptoms of the flu?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'Hello Jane! Common symptoms of the flu (influenza) include fever, chills, muscle aches, cough, congestion, runny nose, headaches, and fatigue. If you are experiencing these, getting plenty of rest and staying hydrated is recommended. Would you like me to elaborate on when to see a doctor?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23.9),
      }
    ]
  },
  {
    id: 'chat-2',
    title: 'Diet & Nutrition',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'What are some good sources of plant-based protein?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: 'Great question! Excellent sources of plant-based protein include:\n\n- **Lentils:** Great for soups and stews.\n- **Chickpeas:** Versatile for hummus or salads.\n- **Quinoa:** A complete protein.\n- **Tofu and Tempeh:** Soy-based and very adaptable.\n- **Nuts and Seeds:** Especially almonds, chia seeds, and hemp seeds.\n\nIncorporating a variety of these into your diet ensures you get all essential amino acids.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 47.9),
      }
    ]
  }
];

export const generateMockAIResponse = (userMessage: string): string => {
  const lowerMsg = userMessage.toLowerCase();
  if (lowerMsg.includes('headache')) {
    return "Headaches can be caused by dehydration, stress, lack of sleep, or eye strain. Try drinking water, resting in a quiet, dark room, or practicing relaxation techniques. If it's severe or persistent, please consult a healthcare professional.";
  }
  if (lowerMsg.includes('sleep')) {
    return "Good sleep hygiene is essential for health. Try to maintain a consistent sleep schedule, limit screen time an hour before bed, and keep your bedroom cool and dark.";
  }
  return "I'm a mock AI assistant designed for healthcare information. I understand you're asking about your health. Could you provide a bit more detail so I can offer general guidance? Remember, for accurate diagnosis and treatment, always consult a qualified medical professional.";
};
