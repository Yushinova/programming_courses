import { mysqlTable, serial, text, int } from 'drizzle-orm/mysql-core';
import { courses } from './courses';

export const requirements = mysqlTable('requirements', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  courseId: int('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
});