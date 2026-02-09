import { db } from '@/lib/db/migrations/client';
import { categories, courses, requirements, outcomes } from './schema';
import { eq, and, like, desc, asc, sql } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type Category = InferSelectModel<typeof categories>;
export type Course = InferSelectModel<typeof courses>;
export type Requirement = InferSelectModel<typeof requirements>;
export type Outcome = InferSelectModel<typeof outcomes>;

export type NewCategory = InferInsertModel<typeof categories>;
export type NewCourse = InferInsertModel<typeof courses>;
export type NewRequirement = InferInsertModel<typeof requirements>;
export type NewOutcome = InferInsertModel<typeof outcomes>;

export interface GPTAnalysis {
  age?: number;
  level?: 'начальный' | 'средний' | 'продвинутый';
  keywords: string[];
  category?: 'дети' | 'подростки' | 'взрослые';
  matchedCourseIds?: number[]; // ← Добавим ID найденных курсов
}

export class CoursesRepository {
  // === Категории ===
  async createCategory(data: NewCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(data)
      .returning();
    return category;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  // === Курсы ===
  async createCourse(data: NewCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(data)
      .returning();
    return course;
  }

  async getCourses(filters?: {
  categoryId?: number;
  level?: Course['level'];
  isActive?: boolean;
}): Promise<Course[]> {
  // Если нет фильтров
  if (!filters || Object.keys(filters).length === 0) {
    return await db
      .select()
      .from(courses)
      .orderBy(desc(courses.createdAt));
  }

  // Собираем условия
  const conditions = [];
  
  if (filters.categoryId) {
    conditions.push(eq(courses.categoryId, filters.categoryId));
  }
  if (filters.level) {
    conditions.push(eq(courses.level, filters.level));
  }
  if (filters.isActive !== undefined) {
    conditions.push(eq(courses.isActive, filters.isActive));
  }

  // Если есть условия, применяем их
  if (conditions.length === 1) {
    return await db
      .select()
      .from(courses)
      .where(conditions[0])
      .orderBy(desc(courses.createdAt));
  } else if (conditions.length > 1) {
    return await db
      .select()
      .from(courses)
      .where(and(...conditions))
      .orderBy(desc(courses.createdAt));
  }

  return await db
    .select()
    .from(courses)
    .orderBy(desc(courses.createdAt));
}

  async getCourseByUrl(url: string): Promise<Course | null> {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.url, url))
      .limit(1);
    return course || null;
  }

  async searchCourses(query: string): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(
        and(
          eq(courses.isActive, true),
          like(courses.title, `%${query}%`)
        )
      )
      .orderBy(desc(courses.createdAt));
  }

  // === Требования ===
  async addRequirement(data: NewRequirement): Promise<Requirement> {
    const [requirement] = await db
      .insert(requirements)
      .values(data)
      .returning();
    return requirement;
  }

  async getCourseRequirements(courseId: number): Promise<Requirement[]> {
    return await db
      .select()
      .from(requirements)
      .where(eq(requirements.courseId, courseId))
      .orderBy(asc(requirements.id));
  }

  // === Результаты ===
  async addOutcome(data: NewOutcome): Promise<Outcome> {
    const [outcome] = await db
      .insert(outcomes)
      .values(data)
      .returning();
    return outcome;
  }

  async getCourseOutcomes(courseId: number): Promise<Outcome[]> {
    return await db
      .select()
      .from(outcomes)
      .where(eq(outcomes.courseId, courseId))
      .orderBy(asc(outcomes.id));
  }

  // === Статистика ===
  async getStats() {
    const [totalCourses] = await db.select({ count: count() }).from(courses);
    const [activeCourses] = await db
      .select({ count: count() })
      .from(courses)
      .where(eq(courses.isActive, true));
    
    const coursesByLevel = await db
      .select({
        level: courses.level,
        count: count(),
      })
      .from(courses)
      .where(eq(courses.isActive, true))
      .groupBy(courses.level);

    return {
      totalCourses: totalCourses?.count || 0,
      activeCourses: activeCourses?.count || 0,
      coursesByLevel: coursesByLevel.reduce((acc, curr) => {
        acc[curr.level] = curr.count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
// === МЕТОДЫ ДЛЯ ALEX БОТА ===

  // 1. Поиск курсов по возрасту
  async getCoursesByAge(age: number): Promise<Course[]> {
    let categoryId: number;
    
    if (age <= 12) {
      categoryId = 1; // "Для детей"
    } else if (age <= 18) {
      categoryId = 2; // "Для подростков"
    } else {
      categoryId = 3; // "Для взрослых"
    }
    
    return await this.getCourses({
      categoryId,
      isActive: true
    });
  }

  // 2. Поиск курсов по уровню
  async getCoursesByLevel(level: Course['level']): Promise<Course[]> {
    return await this.getCourses({
      level,
      isActive: true
    });
  }

  // 3. Умный поиск по анализу GPT (ОСНОВНОЙ МЕТОД ДЛЯ ALEX)
  async findCoursesByGPTAnalysis(analysis: GPTAnalysis): Promise<{
  courses: Course[];
  analysis: GPTAnalysis;
}> {
  // Базовые фильтры
  const filters: any = { isActive: true };
  
  // 1. Фильтр по возрасту/категории
  if (analysis.age) {
    if (analysis.age <= 12) filters.categoryId = 1;
    else if (analysis.age <= 18) filters.categoryId = 2;
    else filters.categoryId = 3;
  } else if (analysis.category) {
    // Или по категории из GPT
    const categoryMap = {
      'дети': 1,
      'подростки': 2, 
      'взрослые': 3
    };
    if (categoryMap[analysis.category as keyof typeof categoryMap]) {
      filters.categoryId = categoryMap[analysis.category as keyof typeof categoryMap];
    }
  }
  
  // 2. Фильтр по уровню
  if (analysis.level && ['начальный', 'средний', 'продвинутый'].includes(analysis.level)) {
    filters.level = analysis.level;
  }
  
  // 3. Получаем курсы по базовым фильтрам
  let foundCourses = await this.getCourses(filters);
  
  // 4. Если есть ключевые слова - фильтруем дополнительно
  if (analysis.keywords && analysis.keywords.length > 0) {
    foundCourses = this.filterCoursesByKeywords(foundCourses, analysis.keywords);
  }
  
  // 5. Сортируем по релевантности
  foundCourses.sort((a, b) => {
    const scoreA = this.calculateCourseRelevance(a, analysis);
    const scoreB = this.calculateCourseRelevance(b, analysis);
    return scoreB - scoreA; // по убыванию
  });
  
  // 6. Берем топ-5
  const topCourses = foundCourses.slice(0, 5);
  
  // 7. Сохраняем ID найденных курсов в анализе
  const updatedAnalysis: GPTAnalysis = {
    ...analysis,
    matchedCourseIds: topCourses.map(course => course.id)
  };
  
  // 8. Возвращаем объект с курсами и обновленным анализом
  return {
    courses: topCourses,
    analysis: updatedAnalysis
  };
}

  // 4. Простой поиск по ключевым словам (для быстрого старта)
  async searchCoursesByKeywords(keywords: string[]): Promise<Course[]> {
    if (!keywords || keywords.length === 0) {
      return await this.getCourses({ isActive: true });
    }
    
    const allCourses = await this.getCourses({ isActive: true });
    return this.filterCoursesByKeywords(allCourses, keywords);
  }

  // 5. Получение топ рекомендаций (упрощенный метод)
  async getTopRecommendations(params: {
    age?: number;
    level?: Course['level'];
    interests?: string[];
  }): Promise<Course[]> {
    const filters: any = { isActive: true };

    // Фильтр по возрасту
    if (params.age) {
      if (params.age <= 12) filters.categoryId = 1;
      else if (params.age <= 18) filters.categoryId = 2;
      else filters.categoryId = 3;
    }

    // Фильтр по уровню
    if (params.level) {
      filters.level = params.level;
    }

    let courses = await this.getCourses(filters);

    // Фильтр по интересам если есть
    if (params.interests && params.interests.length > 0) {
      courses = this.filterCoursesByKeywords(courses, params.interests);
    }

    // Ограничиваем 3 результатами
    return courses.slice(0, 3);
  }

  // 6. Получение курса со всеми деталями (для подробного ответа)
  async getCourseWithDetails(courseId: number) {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) return null;

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, course.categoryId))
      .limit(1);

    const courseRequirements = await this.getCourseRequirements(courseId);
    const courseOutcomes = await this.getCourseOutcomes(courseId);

    return {
      ...course,
      category,
      requirements: courseRequirements,
      outcomes: courseOutcomes
    };
  }

  // === ВСПОМОГАТЕЛЬНЫЕ ПРИВАТНЫЕ МЕТОДЫ ===

  // Фильтрация курсов по ключевым словам
  private filterCoursesByKeywords(courses: Course[], keywords: string[]): Course[] {
    if (!keywords || keywords.length === 0) return courses;
    
    return courses.filter(course => {
      const courseText = `
        ${course.title.toLowerCase()}
        ${course.description.toLowerCase()}
      `;
      
      // Проверяем наличие хотя бы одного ключевого слова
      return keywords.some(keyword => 
        keyword && courseText.includes(keyword.toLowerCase())
      );
    });
  }

  // Подсчет релевантности курса
  private calculateCourseRelevance(course: Course, analysis: GPTAnalysis): number {
    let score = 0;
    const courseText = `${course.title} ${course.description}`.toLowerCase();
    
    // За ключевые слова
    if (analysis.keywords) {
      analysis.keywords.forEach((keyword: string) => {
        if (keyword && courseText.includes(keyword.toLowerCase())) {
          score += 3;
        }
      });
    }
    
    // За точное совпадение уровня
    if (course.level === analysis.level) score += 5;
    
    // За активный курс
    if (course.isActive) score += 2;
    
    // Новые курсы предпочтительнее
    const daysOld = (new Date().getTime() - new Date(course.createdAt).getTime()) / (1000 * 3600 * 24);
    if (daysOld < 30) score += 1;
    
    return score;
  }

  // Извлечение ключевых слов из запроса (простая версия, можно использовать если GPT не работает)
  extractKeywordsFromQuery(query: string): string[] {
    const queryLower = query.toLowerCase();
    const keywords: string[] = [];

    // Технологии
    const techKeywords = [
      { words: ['javascript', 'js', 'джаваскрипт'], tag: 'javascript' },
      { words: ['python', 'питон'], tag: 'python' },
      { words: ['react', 'реакт'], tag: 'react' },
      { words: ['html', 'css', 'верстк'], tag: 'html' },
      { words: ['игр', 'unity', 'геймдев', 'game'], tag: 'игры' },
      { words: ['сайт', 'веб', 'web', 'frontend'], tag: 'веб' },
      { words: ['данн', 'data', 'анализ', 'машинн'], tag: 'данные' },
      { words: ['мобильн', 'android', 'ios'], tag: 'мобильные' }
    ];

    // Добавляем найденные ключевые слова
    techKeywords.forEach(marker => {
      if (marker.words.some(word => queryLower.includes(word))) {
        keywords.push(marker.tag);
      }
    });

    return keywords;
  }
  // Получение курса по ID с URL
async getCourseById(id: number): Promise<Course | null> {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);
  return course || null;
}

// Получение курса по slug/url
async getCourseBySlug(slug: string): Promise<Course | null> {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.url, slug))
    .limit(1);
  return course || null;
}

// Формирование ссылки на курс
getCourseLink(course: Course): string {
  return `/courses/${course.url}`; // или /courses/${course.id}
}

// Получение нескольких курсов по ID
async getCoursesByIds(ids: number[]): Promise<Course[]> {
  if (!ids.length) return [];
  
  return await db
    .select()
    .from(courses)
    .where(sql`${courses.id} IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`);
}

// Формирование HTML ссылок для GPT
formatCoursesWithLinks(courses: Course[]): string {
  return courses.map(course => 
    `• <a href="/courses/${course.url}">${course.title}</a> (${course.level}, ${course.duration}, ${course.price}₽)`
  ).join('\n');
}

// Альтернатива: Markdown ссылки
formatCoursesWithMarkdownLinks(courses: Course[]): string {
  return courses.map(course => 
    `• [${course.title}](/courses/${course.url}) (${course.level}, ${course.duration}, ${course.price}₽)`
  ).join('\n');
}
}

// Экспорт синглтон инстанса для удобства
export const coursesRepository = new CoursesRepository();

// Хелпер функция для count
function count() {
  return sql<number>`count(*)`;
}