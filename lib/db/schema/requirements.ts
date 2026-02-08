import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';
import { courses } from './courses';

export const requirements = pgTable('requirements', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
});
