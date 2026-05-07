'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

// Типы для сообщений
type MessageRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  role: MessageRole;
  content: string;
}

interface AlexBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlexBot({ isOpen, onClose }: AlexBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Привет! Я Alex 🤖 — ваш помощник по выбору курсов программирования. Сколько вам лет? Расскажите, что вы хотите изучить или какой у вас опыт?'
    }
  ]);
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Автоскролл к новым сообщениям
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Фокус на инпут при открытии
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Определяем мобильное устройство
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Добавляем сообщение пользователя
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: data.response }
        ]);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages([
        ...newMessages,
        { 
          role: 'assistant', 
          content: 'Извините, произошла ошибка. Пожалуйста, попробуйте позже.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\((\/[^)]+)\)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      const [_, text, href] = match;
      parts.push(
        <Link 
          key={match.index}
          href={href}
          className="text-blue-400 hover:text-blue-300 underline break-words"
          onClick={() => {
            onClose();
            router.push(href);
          }}
        >
          {text}
        </Link>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : content;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "Курсы для начинающих",
    "Изучить Python",
    "Мне 14 лет",
    "Веб-разработка"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl h-[95vh] md:h-[90vh] max-h-[800px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl md:rounded-2xl shadow-2xl overflow-hidden border border-gray-700 flex flex-col">
        
        {/* Упрощенный заголовок для мобильных */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 md:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-white/20 rounded-full blur"></div>
                <div className="relative bg-white p-1.5 md:p-2 rounded-full">
                  <Bot className="w-5 h-5 md:w-8 md:h-8 text-blue-600" />
                </div>
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-white">Alex</h2>
                <p className="text-xs md:text-sm text-blue-100 hidden sm:block">
                  Помощник по курсам программирования
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 md:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Чат - занимает всё доступное пространство */}
        <div ref={chatContainerRef} className="flex-1 flex flex-col min-h-0">
          
          {/* Сообщения с прокруткой */}
          <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 md:gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] md:max-w-[80%] rounded-xl md:rounded-2xl p-2.5 md:p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none'
                      : 'bg-gray-800/50 border border-gray-700 rounded-bl-none'
                  }`}
                >
                  <div className={`flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'user' ? (
                      <>
                        <span className="text-xs md:text-sm font-medium">Вы</span>
                        <User className="w-3 h-3 md:w-4 md:h-4" />
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                        <span className="text-xs md:text-sm font-medium text-white">Alex</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm md:text-base whitespace-pre-wrap break-words text-white">
                    {formatMessage(message.content)}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {/* Индикатор загрузки */}
            {isLoading && (
              <div className="flex gap-2 md:gap-3">
                <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" />
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl md:rounded-2xl rounded-bl-none p-2.5 md:p-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-3 h-3 md:w-4 md:h-4 text-white"/>
                    <span className="text-xs md:text-sm font-medium text-white">Alex печатает</span>
                  </div>
                  <div className="flex gap-1 mt-1.5 md:mt-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Сворачиваемые быстрые вопросы */}
          {isMobile ? (
            <div className="flex-shrink-0 border-t border-gray-700 bg-gray-800/30">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="w-full px-4 py-2 flex items-center justify-between text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Быстрые вопросы
                </span>
                {showSuggestions ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              
              {showSuggestions && (
                <div className="px-3 pb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInput(question);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="text-xs px-2.5 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-full text-gray-300 hover:text-white transition-colors border border-gray-700"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Десктопная версия быстрых вопросов
            <div className="flex-shrink-0 px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Быстрый вопрос:
                </span>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className="text-sm px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-full text-gray-300 hover:text-white transition-colors border border-gray-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Поле ввода - фиксированное внизу */}
          <div className="flex-shrink-0 border-t border-gray-700 p-3 md:p-6 bg-gray-800/30">
            <div className="flex gap-2 md:gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isMobile ? "Вопрос..." : "Напишите ваш вопрос..."}
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`px-4 md:px-6 rounded-lg md:rounded-xl font-medium transition-all duration-300 ${
                  isLoading || !input.trim()
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30'
                }`}
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5 md:mt-2 text-center hidden sm:block">
              Alex поможет выбрать курс, ответит на вопросы о программировании
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}