import { CoursesRepository } from '@/lib/db/repository';
import Link from 'next/link';
import { Code2, Clock, DollarSign, Users } from 'lucide-react';

export async function generateMetadata() {
  return {
    title: 'Все курсы программирования',
    description: 'Выберите курс программирования для любого возраста и уровня',
  };
}

export default async function CoursesPage() {
  const repository = new CoursesRepository();
  
  // Просто получаем все активные курсы
  const courses = await repository.getCourses({
    isActive: true
  });

  // Цвета для категорий
  const getCategoryColor = (categoryId: number) => {
    switch(categoryId) {
      case 1: return 'bg-gradient-to-r from-pink-400 to-purple-400';
      case 2: return 'bg-gradient-to-r from-blue-400 to-cyan-400';
      case 3: return 'bg-gradient-to-r from-green-400 to-emerald-400';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  // Цвет для уровня
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'начальный': return 'bg-green-100 text-green-800';
      case 'средний': return 'bg-yellow-100 text-yellow-800';
      case 'продвинутый': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Простой заголовок */}
      <div className="bg-white border-b py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Все курсы</h1>
          </div>
          <p className="text-gray-600">
            {courses.length} курсов доступно для обучения
          </p>
        </div>
      </div>

      {/* Список курсов */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Картинка */}
                <div className="h-48 relative overflow-hidden">
                  {course.imageUrl ? (
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full ${getCategoryColor(course.categoryId)}`} />
                  )}
                  
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Контент */}
                <div className="p-6">
                  <Link href={`/courses/${course.url}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600">
                      {course.title}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Категория {course.categoryId}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-xl font-bold">
                        {course.price.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <Link 
                      href={`/courses/${course.url}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Code2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Курсы в разработке</h3>
            <p className="text-gray-500">Скоро здесь появятся новые курсы</p>
          </div>
        )}
      </div>
    </div>
  );
}