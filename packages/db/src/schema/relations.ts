import { relations } from 'drizzle-orm';
import { courses } from './courses';
import { modules } from './modules';
import { lessons } from './lessons';
import { users } from './users';
import { categories } from './categories';

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, { fields: [courses.instructorId], references: [users.id] }),
  category: one(categories, { fields: [courses.categoryId], references: [categories.id] }),
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, { fields: [modules.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));
