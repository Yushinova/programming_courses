'use client';

import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import AlexBot from '@/components/AlexBot';

export default function AlexBotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Плавающая кнопка */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 group"
      >
        <div className="relative">
          {/* Эффект пульсации */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-30 animate-ping"></div>
          
          {/* Основная кнопка */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-white/20 rounded-full blur"></div>
              <MessageSquare className="relative w-6 h-6" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-bold">Спроси Alex</div>
              <div className="text-xs opacity-90">Помощник по курсам</div>
            </div>
          </div>
        </div>
      </button>

      {/* Кнопка в мобильном виде (только иконка) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 sm:hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl">
          <MessageSquare className="w-6 h-6" />
        </div>
      </button>

      {/* Компонент бота */}
      <AlexBot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}