'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      // Используем fetch к нашему API route
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
        // Добавляем ответ бота
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
// Функция для обработки сообщений с ссылками
const formatMessage = (content: string) => {
  // Заменяем Markdown ссылки на React компоненты
  const linkRegex = /\[([^\]]+)\]\((\/[^)]+)\)/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    // Текст до ссылки
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    
    // Ссылка
    const [_, text, href] = match;
    parts.push(
      <Link 
        key={match.index}
        href={href}
        className="text-blue-400 hover:text-blue-300 underline"
        onClick={() => {
          onClose(); // Закрываем модалку при клике
          router.push(href);
        }}
      >
        {text}
      </Link>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Остаток текста
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
    "Какие курсы для начинающих?",
    "Хочу изучить Python",
    "Мне 14 лет, что посоветуете?",
    "Как стать веб-разработчиком?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-white/20 rounded-full blur"></div>
                <div className="relative bg-white p-2 rounded-full">
                  <Bot className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Alex</h2>
                <p className="text-sm text-blue-100">Помощник по курсам программирования</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Чат */}
        <div className="h-[500px] flex flex-col">
          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none'
                      : 'bg-gray-800/50 border border-gray-700 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === 'user' ? (
                      <>
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Вы</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 text-white" />
                        <span className="text-sm font-medium text-white">Alex</span>
                      </>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap text-white">{formatMessage(message.content)}</div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {/* Индикатор загрузки */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl rounded-bl-none p-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-white"/>
                    <span className="text-sm font-medium text-white">Alex печатает</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Предлагаемые вопросы */}
          <div className="px-6 pb-4">
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
                    setTimeout(() => {
                      if (inputRef.current) {
                        inputRef.current.focus();
                      }
                    }, 50);
                  }}
                  className="text-sm px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-full text-gray-300 hover:text-white transition-colors border border-gray-700"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Поле ввода */}
          <div className="border-t border-gray-700 p-6">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Напишите ваш вопрос..."
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`px-6 rounded-xl font-medium transition-all duration-300 ${
                  isLoading || !input.trim()
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Alex поможет выбрать курс, ответит на вопросы о программировании
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}