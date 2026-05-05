import { mysqlTable, serial, varchar, text, int, boolean, timestamp } from 'drizzle-orm/mysql-core';
import { categories } from './categories';

export const courses = mysqlTable('courses', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  level: varchar('level', { length: 20 })
    .notNull()
    .$type<'начальный' | 'средний' | 'продвинутый'>(),
  duration: varchar('duration', { length: 50 }).notNull(),
  price: int('price').notNull(),
  currency: varchar('currency', { length: 3 }).default('RUB'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  url: varchar('url', { length: 200 }).notNull().unique(),
  imageUrl: varchar('image_url', { length: 500 }),
  categoryId: int('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
});