import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { courses } from './courses';

export const outcomes = pgTable('outcomes', {
  id: serial('id').primaryKey(),
  skill: varchar('skill', { length: 200 }).notNull(),
  level: varchar('level', { length: 20 })
    .notNull()
    .$type<'начальный' | 'средний' | 'продвинутый'>(),
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
});