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

export class CoursesRepository {
  // === Категории ===
  async createCategory(data: NewCategory): Promise<Category> {
  const result = await db.insert(categories).values(data).$returningId();
  const insertedId = result[0].id;
  
  // Явно указываем, что выбираем одну запись
  const selectedCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.id, insertedId));
  
  // Проверяем, что запись найдена, и возвращаем её
  if (!selectedCategories[0]) {
    throw new Error('Failed to create category');
  }
  
  return selectedCategories[0];
}

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  // === Курсы ===
  async createCourse(data: NewCourse): Promise<Course> {
  const result = await db.insert(courses).values(data).$returningId();
  const insertedId = result[0].id;
  
  const selectedCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.id, insertedId));
  
  if (!selectedCourses[0]) {
    throw new Error('Failed to create course');
  }
  
  return selectedCourses[0];
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

  // === Требования ===
  async addRequirement(data: NewRequirement): Promise<Requirement> {
  const result = await db.insert(requirements).values(data).$returningId();
  const insertedId = result[0].id;
  
  const selectedRequirements = await db
    .select()
    .from(requirements)
    .where(eq(requirements.id, insertedId));
  
  if (!selectedRequirements[0]) {
    throw new Error('Failed to add requirement');
  }
  
  return selectedRequirements[0];
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
  const result = await db.insert(outcomes).values(data).$returningId();
  const insertedId = result[0].id;
  
  const selectedOutcomes = await db
    .select()
    .from(outcomes)
    .where(eq(outcomes.id, insertedId));
  
  if (!selectedOutcomes[0]) {
    throw new Error('Failed to add outcome');
  }
  
  return selectedOutcomes[0];
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
    `• <a href=/courses/${course.url}>${course.title}</a> (${course.level}, ${course.duration}, ${course.price}₽)`
  ).join('\n');
}

// Альтернатива: Markdown ссылки
formatCoursesWithMarkdownLinks(courses: Course[]): string {
  return courses.map(course => 
    `• [${course.title}](/courses/${course.url}) (${course.level}, ${course.duration}, ${course.price}₽)`
  ).join('\n');
}

async getAllCoursesWithDetails(): Promise<Array<{
    course: string;
    requirements: string[];
    outcomes: string[];
  }>> {
    // Получаем ВСЕ курсы без фильтров
    const allCourses = await db
      .select()
      .from(courses)
      .orderBy(asc(courses.id));

    if (!allCourses.length) {
      return [];
    }

    // Собираем детали для каждого курса
    const coursesWithDetails = await Promise.all(
      allCourses.map(async (course) => {
        // Получаем требования курса
        const requirementsList = await db
          .select()
          .from(requirements)
          .where(eq(requirements.courseId, course.id))
          .orderBy(asc(requirements.id));

        // Получаем результаты курса
        const outcomesList = await db
          .select()
          .from(outcomes)
          .where(eq(outcomes.courseId, course.id))
          .orderBy(asc(outcomes.id));

        // Форматируем строку курса
        const courseString = `${course.title} | Уровень: ${course.level} | Длительность: ${course.duration} | Цена: ${course.price}${course.currency || '₽'} | Активный: ${course.isActive ? 'Да' : 'Нет'} | Категория ID: ${course.categoryId}`;

        return {
          course: courseString,
          requirements: requirementsList.map(req => req.text), // requirements.text
          outcomes: outcomesList.map(outcome => `${outcome.skill} (${outcome.level})`) // outcomes.skill + outcomes.level
        };
      })
    );

    return coursesWithDetails;
  }

  /**
   * Альтернативная версия: получить все курсы с деталями в виде плоской структуры
   * @returns Массив строк, где каждый курс представлен одной строкой
   */
  async getAllCoursesAsStrings(): Promise<string[]> {
    const allCourses = await db
      .select()
      .from(courses)
      .orderBy(asc(courses.id));

    if (!allCourses.length) {
      return ['Курсы не найдены'];
    }

    const coursesAsStrings = await Promise.all(
      allCourses.map(async (course) => {
        const requirementsList = await db
          .select()
          .from(requirements)
          .where(eq(requirements.courseId, course.id));
        
        const outcomesList = await db
          .select()
          .from(outcomes)
          .where(eq(outcomes.courseId, course.id));

        // Форматируем в единую строку
        const courseInfo = `
        Курс: ${course.title}
        Описание: ${course.description}
        Уровень: ${course.level}
        Длительность: ${course.duration}
        Цена: ${course.price}${course.currency || '₽'}
        URL: ${course.url}
        Статус: ${course.isActive ? 'Активный' : 'Неактивный'}
        Категория ID: ${course.categoryId}
        ${course.imageUrl ? `Изображение: ${course.imageUrl}` : ''}

        Требования:
        ${requirementsList.length > 0 ? requirementsList.map(req => `  • ${req.text}`).join('\n') : '  Нет требований'}

        Результаты (навыки):
        ${outcomesList.length > 0 ? outcomesList.map(out => `  • ${out.skill} (уровень: ${out.level})`).join('\n') : '  Нет результатов'}
                `.trim();

        return courseInfo;
      })
    );

    return coursesAsStrings;
  }

  /**
   * Получить все курсы с полной информацией, включая категории
   * @returns Массив строк с полной информацией о курсах
   */
  async getAllCoursesFullInfo(): Promise<string[]> {
    const allCourses = await db
      .select()
      .from(courses)
      .orderBy(asc(courses.id));

    if (!allCourses.length) {
      return ['Курсы не найдены'];
    }

    // Получаем все категории для отображения их имен
    const allCategories = await db.select().from(categories);
    const categoryMap = new Map(allCategories.map(cat => [cat.id, cat.name]));

    const coursesFullInfo = await Promise.all(
      allCourses.map(async (course) => {
        const requirementsList = await db
          .select()
          .from(requirements)
          .where(eq(requirements.courseId, course.id));
        
        const outcomesList = await db
          .select()
          .from(outcomes)
          .where(eq(outcomes.courseId, course.id));

        const categoryName = categoryMap.get(course.categoryId) || `Категория ${course.categoryId}`;

        // Форматируем в единую строку
        const courseInfo = `
          ========================================
          НАЗВАНИЕ: ${course.title}
          КАТЕГОРИЯ: ${categoryName}
          УРОВЕНЬ: ${course.level}
          ДЛИТЕЛЬНОСТЬ: ${course.duration}
          ЦЕНА: ${course.price}${course.currency || '₽'}
          СТАТУС: ${course.isActive ? '✅ Активный' : '❌ Неактивный'}
          URL: /courses/${course.url}
          ${course.imageUrl ? `ИЗОБРАЖЕНИЕ: ${course.imageUrl}` : ''}

          ОПИСАНИЕ:
          ${course.description}

          ТРЕБОВАНИЯ (${requirementsList.length}):
          ${requirementsList.length > 0 ? requirementsList.map((req, i) => `${i + 1}. ${req.text}`).join('\n') : '  Нет требований'}

          РЕЗУЛЬТАТЫ (${outcomesList.length}):
          ${outcomesList.length > 0 ? outcomesList.map((out, i) => `${i + 1}. ${out.skill} (уровень: ${out.level})`).join('\n') : '  Нет результатов'}
          ========================================
                  `.trim();

        return courseInfo;
      })
    );

    return coursesFullInfo;
  }
}

// Экспорт синглтон инстанса для удобства
export const coursesRepository = new CoursesRepository();

// Хелпер функция для count
function count() {
  return sql<number>`cast(count(*) as unsigned)`;
}