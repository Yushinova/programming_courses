import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CoursesRepository } from '@/lib/db/repository';
import { ArrowLeft, Users, Clock, DollarSign, BookOpen, Code2 } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

// Хардкодим категории, так как они фиксированные
const CATEGORIES = [
  { id: 1, name: 'Для детей', ageRange: '7-12', gradient: 'from-pink-500 to-purple-600' },
  { id: 2, name: 'Для подростков', ageRange: '13-18', gradient: 'from-blue-500 to-cyan-600' },
  { id: 3, name: 'Для взрослых', ageRange: '18+', gradient: 'from-green-500 to-emerald-600' },
];

export async function generateMetadata({ params }: CategoryPageProps) {
  const { id } = await params;
  const categoryId = parseInt(id);
  
  const category = CATEGORIES.find(cat => cat.id === categoryId);
  
  if (!category) {
    return {
      title: 'Категория не найдена',
    };
  }
  
  return {
    title: `${category.name} (${category.ageRange}) - Онлайн-курсы`,
    description: `Курсы программирования для ${category.ageRange}. Обучение с нуля.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const categoryId = parseInt(id);
  
  // Проверяем, что categoryId валидный (1, 2 или 3)
  const category = CATEGORIES.find(cat => cat.id === categoryId);
  if (!category) {
    notFound();
  }
  
  const repository = new CoursesRepository();
  
  // ИСПОЛЬЗУЕМ СУЩЕСТВУЮЩИЙ МЕТОД getCourses() с фильтром categoryId
  const courses = await repository.getCourses({
    categoryId: categoryId,
    isActive: true
  });
  
  // Цвет для уровня
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'начальный': return 'bg-green-100 text-green-800';
      case 'средний': return 'bg-yellow-100 text-yellow-800';
      case 'продвинутый': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Склонение "курс"
  const getCourseWord = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return 'курс';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'курса';
    return 'курсов';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер */}
      <div className={`bg-gradient-to-r ${category.gradient} text-white py-12 px-4`}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/courses" className="flex items-center gap-2 text-white/80 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Все курсы
            </Link>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <Users className="h-10 w-10" />
            <h1 className="text-4xl font-bold">{category.name}</h1>
          </div>
          
          <p className="text-xl mb-6 max-w-3xl">
            Курсы программирования для {category.ageRange}. {courses.length} {getCourseWord(courses.length)} доступно.
          </p>
        </div>
      </div>
      
      {/* Курсы */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg border overflow-hidden">
                {/* Картинка */}
                <div className="h-48 relative">
                  {course.imageUrl ? (
                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${category.gradient}`} />
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
                    <h3 className="text-xl font-bold mb-3 hover:text-blue-600">{course.title}</h3>
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
                      <BookOpen className="h-4 w-4" />
                      {category.ageRange}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-2xl font-bold">
                      {course.price.toLocaleString('ru-RU')} ₽
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
            <p className="text-gray-500 mb-6">Для {category.ageRange} пока нет доступных курсов</p>
            <Link href="/courses" className="text-blue-600 hover:underline">
              ← Вернуться к курсам
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return CATEGORIES.map(category => ({
    id: category.id.toString(),
  }));
}