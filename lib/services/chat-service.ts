interface ChatResponse {
  answer: string;
}

interface ChatRequest {
  sessionId: string;
  query: string;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatHistoryResponse {
  success: boolean;
  data?: ChatMessage[];
  error?: string;
}

interface ChatResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  sessionId: string; // Backend session ID
  title: string;
  messages: Message[];
  lastMessage: Date;
}

// Local storage keys
const CHAT_SESSIONS_KEY = 'chatSessions';
const CURRENT_CHAT_ID_KEY = 'currentChatId';

const BASE_URL = process.env.BASE_URL;

export async function getChatHistory(
  sessionId: string
): Promise<ChatHistoryResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/history?sessionId=${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.json();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  console.log('request ', request);

  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateChatId(): string {
  return (
    'chat_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  );
}

export async function resetChatSession(
  sessionId: string
): Promise<ChatResetResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    return response.json();
  } catch (error) {
    console.error('Error resetting chat session:', error);
    throw error;
  }
}

// New functions for managing chat sessions
export function getStoredChatSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(CHAT_SESSIONS_KEY);
    if (!stored) return [];

    const sessions = JSON.parse(stored);
    // Convert date strings back to Date objects
    return sessions.map((session: any) => ({
      ...session,
      lastMessage: new Date(session.lastMessage),
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Error loading stored chat sessions:', error);
    return [];
  }
}

export function storeChatSessions(sessions: ChatSession[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error storing chat sessions:', error);
  }
}

export function getStoredCurrentChatId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_CHAT_ID_KEY);
}

export function storeCurrentChatId(chatId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_CHAT_ID_KEY, chatId);
}

export function createNewChatSession(): ChatSession {
  const chatId = generateChatId();
  const sessionId = generateSessionId();

  return {
    id: chatId,
    sessionId: sessionId,
    title: 'New Chat',
    messages: [
      {
        id: '1',
        content: 'Hello! How can I help you today?',
        isUser: false,
        timestamp: new Date(),
      },
    ],
    lastMessage: new Date(),
  };
}

// Load chat history for a specific session and merge with existing data
export async function loadChatHistoryForSession(
  chatSession: ChatSession
): Promise<ChatSession | null> {
  try {
    const history = await getChatHistory(chatSession.sessionId);

    if (history.success && history.data && history.data.length > 0) {
      const messages = history.data.map((msg, index) => ({
        id: `history_${index}`,
        content: msg.text,
        isUser: msg.sender === 'user',
        timestamp: new Date(),
      }));

      return {
        ...chatSession,
        messages: messages,
        title:
          chatSession.title === 'New Chat'
            ? messages.find((m) => m.isUser)?.content.slice(0, 30) + '...' ||
              'Chat History'
            : chatSession.title,
      };
    }

    return chatSession;
  } catch (error) {
    console.error(
      'Error loading chat history for session:',
      chatSession.sessionId,
      error
    );
    return chatSession; // Return original session if loading fails
  }
}
