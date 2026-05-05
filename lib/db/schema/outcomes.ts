import { mysqlTable, serial, varchar, int } from 'drizzle-orm/mysql-core';
import { courses } from './courses';

export const outcomes = mysqlTable('outcomes', {
  id: serial('id').primaryKey(),
  skill: varchar('skill', { length: 200 }).notNull(),
  level: varchar('level', { length: 20 })
    .notNull()
    .$type<'начальный' | 'средний' | 'продвинутый'>(),
  courseId: int('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
});