'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Users, Trophy, Clock, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import AlexBot from '@/components/AlexBot';

export default function HomePage() {
  const [isBotOpen, setIsBotOpen] = useState(false);
const [stars, setStars] = useState<Array<{ left: string; top: string; delay: string; opacity: number }>>([]);

  // Инициализируем звезды на клиенте
  useEffect(() => {
    const newStars = [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      opacity: Math.random() * 0.7 + 0.3
    }));
    setStars(newStars);
  }, []);

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Для любого возраста',
      description: 'От 7 лет и старше, программы для всех уровней'
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Практические навыки',
      description: 'Реальные проекты в портфолио после каждого курса'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Гибкий график',
      description: 'Учитесь в удобное время, онлайн или оффлайн'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero секция с фоновой картинкой */}
      <section 
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(/placeholder-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Темный оверлей для лучшей читаемости текста */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Эффект градиента сверху */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 to-transparent"></div>
        
        {/* Эффект частиц/звезд (опционально) */}
        <div className="absolute inset-0">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.delay,
                opacity: star.opacity
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-5xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Не можете решить
            </span>
            <br />
            <span className="text-white">какой курс подойдет именно вам?</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Мы поможем с выбором! Пройдите тест и получите персональную подборку курсов 
            под ваш уровень и цели
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Кнопка открытия бота */}
            <button
              onClick={() => setIsBotOpen(true)}
              className="group relative px-8 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                Подобрать курс
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </div>
            </button>

            <Link
              href="/courses"
              className="px-8 py-4 text-lg font-medium rounded-xl bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
            >
              Смотреть все курсы
            </Link>
          </div>

          {/* Статистика */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-gray-400">Курсов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">5000+</div>
              <div className="text-gray-400">Выпускников</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-gray-400">Довольных студентов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Поддержка</div>
            </div>
          </div>
        </div>

        {/* Скролл вниз индикатор */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Секция преимуществ */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Почему выбирают нас?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Современный подход к обучению программированию
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Эффект свечения */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative">
                  <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Бот - теперь внутри главной страницы */}
      <AlexBot isOpen={isBotOpen} onClose={() => setIsBotOpen(false)} />
    </div>
  );
}