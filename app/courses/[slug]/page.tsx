import { notFound } from 'next/navigation';
import { coursesRepository } from '@/lib/db/repository';
import Link from 'next/link';
import { ArrowLeft, Calendar, CreditCard, Users, BookOpen, CheckCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;
  const course = await coursesRepository.getCourseBySlug(slug);
  
  if (!course) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к курсам
          </Link>
        </div>
        
        {/* Основной контент */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Заголовок */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {course.level}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {course.duration}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {course.price.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg opacity-90">{course.description}</p>
          </div>
          
          {/* Детали */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Левая колонка - информация */}
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-6">О курсе</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-semibold">Длительность</div>
                      <div className="text-gray-600">{course.duration}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <CreditCard className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-semibold">Стоимость</div>
                      <div className="text-gray-600">{course.price.toLocaleString('ru-RU')} ₽</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="font-semibold">Формат</div>
                      <div className="text-gray-600">Онлайн</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                    <div>
                      <div className="font-semibold">Поддержка</div>
                      <div className="text-gray-600">24/7</div>
                    </div>
                  </div>
                </div>
                
                {/* Кнопка записи */}
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold py-4 rounded-xl hover:shadow-xl transition-shadow mb-8">
                  Записаться на курс
                </button>
                
                {/* Кнопка обратно к Alex */}
                <div className="text-center">
                  <Link
                    href="/#alex-bot"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <span>Нужна помощь с выбором? Спросите у Alex!</span>
                  </Link>
                </div>
              </div>
              
              {/* Правая колонка - быстрая информация */}
              <div className="md:col-span-1">
                <div className="bg-blue-50 rounded-xl p-6 sticky top-8">
                  <h3 className="text-xl font-bold mb-4">Быстрый старт</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-semibold">Готов начать?</div>
                        <div className="text-sm text-gray-600">Начните обучение сегодня</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-semibold">Онлайн доступ</div>
                        <div className="text-sm text-gray-600">Учитесь из любой точки мира</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-semibold">Сертификат</div>
                        <div className="text-sm text-gray-600">По окончании курса</div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors">
                    Бесплатная консультация
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}