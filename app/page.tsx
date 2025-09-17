'use client';

import { useState, useEffect } from 'react';
import ChatSidebar from '@/components/chat-sidebar';
import ChatArea from '@/components/chat-area';
import {
  sendMessage,
  resetChatSession,
  getStoredChatSessions,
  storeChatSessions,
  getStoredCurrentChatId,
  storeCurrentChatId,
  createNewChatSession,
  loadChatHistoryForSession,
  type Message,
  type ChatSession,
} from '@/lib/services/chat-service';

export default function ChatPage() {
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Initialize chat sessions on component mount
  useEffect(() => {
    const initializeChatSessions = async () => {
      setIsInitialLoading(true);

      try {
        // Load stored chat sessions
        let storedSessions = getStoredChatSessions();

        // If no stored sessions, create a new one
        if (storedSessions.length === 0) {
          const newSession = createNewChatSession();
          storedSessions = [newSession];
          storeChatSessions(storedSessions);
        }

        // Load chat history for each session that doesn't have messages beyond the initial greeting
        const sessionsWithHistory = await Promise.all(
          storedSessions.map(async (session) => {
            // Only load history if the session only has the initial greeting
            if (session.messages.length <= 1) {
              return await loadChatHistoryForSession(session);
            }
            return session;
          })
        );

        // Filter out any null sessions and update state
        const validSessions = sessionsWithHistory.filter(
          (session): session is ChatSession => session !== null
        );
        setChatSessions(validSessions);
        storeChatSessions(validSessions);

        // Set current chat
        const storedCurrentChatId = getStoredCurrentChatId();
        const validCurrentChatId =
          storedCurrentChatId &&
          validSessions.find((s) => s.id === storedCurrentChatId)
            ? storedCurrentChatId
            : validSessions[0]?.id;

        if (validCurrentChatId) {
          setCurrentChatId(validCurrentChatId);
          storeCurrentChatId(validCurrentChatId);
        }
      } catch (error) {
        console.error('Error initializing chat sessions:', error);
        // Fallback: create a new session if initialization fails
        const newSession = createNewChatSession();
        setChatSessions([newSession]);
        setCurrentChatId(newSession.id);
        storeChatSessions([newSession]);
        storeCurrentChatId(newSession.id);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializeChatSessions();
  }, []);

  // Save chat sessions whenever they change
  useEffect(() => {
    if (!isInitialLoading && chatSessions.length > 0) {
      storeChatSessions(chatSessions);
    }
  }, [chatSessions, isInitialLoading]);

  // Save current chat ID whenever it changes
  useEffect(() => {
    if (currentChatId && !isInitialLoading) {
      storeCurrentChatId(currentChatId);
    }
  }, [currentChatId, isInitialLoading]);

  const currentChat = chatSessions.find((chat) => chat.id === currentChatId);

  const handleSendMessage = async (content: string) => {
    if (!currentChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setIsLoading(true);

    // Add user message immediately
    setChatSessions((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              title:
                chat.title === 'New Chat'
                  ? content.slice(0, 30) + (content.length > 30 ? '...' : '')
                  : chat.title,
              lastMessage: newMessage.timestamp,
            }
          : chat
      )
    );

    try {
      const response = await sendMessage({
        sessionId: currentChat.sessionId,
        query: content,
      });

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        isUser: false,
        timestamp: new Date(),
      };

      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, botResponse],
                lastMessage: botResponse.timestamp,
              }
            : chat
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, errorMessage],
                lastMessage: errorMessage.timestamp,
              }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = async () => {
    if (!currentChat) return;

    setIsLoading(true);
    try {
      const response = await resetChatSession(currentChat.sessionId);
      if (response.success) {
        // Reset the current chat messages
        setChatSessions((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  messages: [
                    {
                      id: '1',
                      content: 'Hello! How can I help you today?',
                      isUser: false,
                      timestamp: new Date(),
                    },
                  ],
                  title: 'New Chat',
                  lastMessage: new Date(),
                }
              : chat
          )
        );
      }
    } catch (error) {
      console.error('Error resetting chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newSession = createNewChatSession();

    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentChatId(newSession.id);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    setChatSessions((prev) => {
      const filtered = prev.filter((chat) => chat.id !== chatId);

      // If we're deleting the current chat, switch to another one
      if (chatId === currentChatId) {
        const nextChat =
          filtered.length > 0 ? filtered[0] : createNewChatSession();
        if (filtered.length === 0) {
          filtered.push(nextChat);
        }
        setCurrentChatId(nextChat.id);
      }

      return filtered;
    });
  };

  if (isInitialLoading) {
    return (
      <div className='flex h-screen bg-background items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-background overflow-hidden'>
      <ChatSidebar
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        // onDeleteChat={handleDeleteChat}
      />
      <ChatArea
        messages={currentChat?.messages || []}
        onSendMessage={handleSendMessage}
        onReset={handleResetChat}
        isLoading={isLoading}
      />
    </div>
  );
}
