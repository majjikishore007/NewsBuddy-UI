'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, RotateCcw } from 'lucide-react';
import type { Message } from '@/app/page';

interface TypingEffectProps {
  text: string;
  onComplete?: () => void;
}

function TypingEffect({ text, onComplete }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return (
    <p className='text-sm leading-relaxed whitespace-pre-wrap'>
      {displayedText}
      {currentIndex < text.length && <span className='animate-pulse'>▋</span>}
    </p>
  );
}

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onReset?: () => void;
  isLoading?: boolean;
}

export default function ChatArea({
  messages,
  onSendMessage,
  onReset,
  isLoading = false,
}: ChatAreaProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className='flex-1 flex flex-col h-screen overflow-hidden'>
      {/* Messages Area */}
      <div className='flex-1 overflow-hidden'>
        <ScrollArea className='h-full p-4'>
          <div className='max-w-3xl mx-auto space-y-6 pb-4'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!message.isUser && (
                  <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0'>
                    <Bot className='w-4 h-4 text-primary-foreground' />
                  </div>
                )}

                <div
                  className={`max-w-[70%] ${
                    message.isUser ? 'order-first' : ''
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-card text-card-foreground'
                    }`}
                  >
                    {!message.isUser &&
                    message.id === messages[messages.length - 1]?.id &&
                    isLoading ? (
                      <TypingEffect text={message.content} />
                    ) : (
                      <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                        {message.content}
                      </p>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1 px-1'>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {message.isUser && (
                  <div className='w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0'>
                    <User className='w-4 h-4 text-secondary-foreground' />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className='border-t border-border p-4 flex-shrink-0'>
        <div className='max-w-3xl mx-auto'>
          <div className='space-y-2'>
            <form onSubmit={handleSubmit} className='flex gap-2'>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder='Type your message here...'
                className='flex-1 bg-input border-border focus:ring-2 focus:ring-ring'
                disabled={isLoading} // Disable input when loading
              />
              <Button
                type='submit'
                disabled={!inputValue.trim() || isLoading}
                className='bg-primary hover:bg-primary/90 text-primary-foreground'
              >
                {isLoading ? (
                  <div className='w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin' />
                ) : (
                  <Send className='w-4 h-4' />
                )}
              </Button>
            </form>
            <div className='flex justify-between items-center'>
              <p className='text-xs text-muted-foreground'>
                Press Enter to send, Shift + Enter for new line
              </p>
              {onReset && (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={onReset}
                  className='text-xs bg-transparent'
                  disabled={isLoading}
                >
                  Reset Chat
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
