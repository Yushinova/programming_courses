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
}

// Хелпер функция для count
function count() {
  return sql<number>`count(*)`;
}