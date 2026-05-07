'use client'
import Link from 'next/link';
import { Code2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const categories = [
    { id: 1, name: 'Для детей', path: '/categories/1', color: 'from-pink-500 to-purple-500' },
    { id: 2, name: 'Для подростков', path: '/categories/2', color: 'from-blue-500 to-cyan-500' },
    { id: 3, name: 'Для взрослых', path: '/categories/3', color: 'from-green-500 to-emerald-500' },
  ];
  
  const router = useRouter();
  
  const handleGoToHome = () => {
    router.push('/');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white shadow-2xl">
      {/* Верхняя полоска */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-1 px-4 text-center text-sm md:text-base">
        🚀 Начни программировать уже сегодня! Скидка 15% на первый курс
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Логотип и название */}
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
              onClick={closeMobileMenu}
            >
              <div className="relative">
                {/* Анимированный логотип */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black p-3 rounded-xl border border-gray-800">
                  <Code2 className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  CodeMaster
                </h1>
                <p className="text-xs text-gray-400 hidden md:block">
                  Программирование для каждого возраста
                </p>
              </div>
            </Link>
          </div>

          {/* Навигация по категориям - Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.path}
                className={`
                  relative group px-5 py-2.5 rounded-full 
                  bg-gradient-to-r ${category.color}
                  text-white font-medium text-sm
                  shadow-lg hover:shadow-xl 
                  transform hover:-translate-y-0.5
                  transition-all duration-300
                  overflow-hidden
                `}
              >
                {/* Эффект свечения */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {category.name}
                
                {/* Подчеркивание при наведении */}
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-white group-hover:w-3/4 group-hover:left-1/4 transition-all duration-300"></div>
              </Link>
            ))}
          </nav>

          {/* Кнопки действий */}
          <div className="flex items-center gap-3">
            {/* Кнопка главная */}
            <button
              onClick={handleGoToHome}
              className={`
                px-4 md:px-6 py-2.5 rounded-full font-medium text-sm
                bg-gradient-to-r from-cyan-500 to-blue-600
                text-white shadow-lg hover:shadow-xl
                transform hover:-translate-y-0.5
                transition-all duration-300
                flex items-center gap-2
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Главная</span>
            </button>

            {/* Кнопка мобильного меню (бургер) */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              aria-label="Меню"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Мобильная навигация - выпадающее меню */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 animate-slideDown">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.path}
                  onClick={closeMobileMenu}
                  className={`
                    px-4 py-3 rounded-lg text-sm font-medium text-center
                    bg-gradient-to-r ${category.color} text-white
                    hover:opacity-90 transition-opacity transform hover:scale-105
                  `}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}