import { mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';

export const categories = mysqlTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  ageRange: varchar('age_range', { length: 50 }).notNull(),
});