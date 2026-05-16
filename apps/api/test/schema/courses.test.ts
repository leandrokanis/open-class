import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, generateSlug, query } from './db-helpers';

// Red phase: these tests fail with "relation 'courses' does not exist"
// until packages/db migration 0001 is applied.

let instructorId: string;

beforeAll(async () => {
  const res = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    ['Test Instructor', `instructor-${Date.now()}@test.com`, 'hash', 'instrutor'],
  );
  instructorId = res.rows[0].id as string;
});

afterAll(async () => {
  await query('DELETE FROM courses WHERE instructor_id = $1', [instructorId]);
  await query('DELETE FROM users WHERE id = $1', [instructorId]);
  await closePool();
});

describe('courses table', () => {
  it('inserts a valid course', async () => {
    const slug = generateSlug('test-course');
    const res = await query(
      `INSERT INTO courses (instructor_id, title, slug)
       VALUES ($1, $2, $3)
       RETURNING id, status`,
      [instructorId, 'Test Course', slug],
    );
    expect(res.rows[0].status).toBe('draft');
  });

  it('enforces slug uniqueness', async () => {
    const slug = generateSlug('unique-slug');
    await query(
      `INSERT INTO courses (instructor_id, title, slug) VALUES ($1, $2, $3)`,
      [instructorId, 'Course A', slug],
    );
    await expect(
      query(
        `INSERT INTO courses (instructor_id, title, slug) VALUES ($1, $2, $3)`,
        [instructorId, 'Course B', slug],
      ),
    ).rejects.toThrow(/unique/i);
  });

  it('rejects an invalid status value', async () => {
    const slug = generateSlug('bad-status');
    await expect(
      query(
        `INSERT INTO courses (instructor_id, title, slug, status) VALUES ($1, $2, $3, $4)`,
        [instructorId, 'Bad Course', slug, 'archived'],
      ),
    ).rejects.toThrow();
  });

  it('cascades delete to modules and lessons when course is deleted', async () => {
    const slug = generateSlug('cascade-course');
    const courseRes = await query(
      `INSERT INTO courses (instructor_id, title, slug) VALUES ($1, $2, $3) RETURNING id`,
      [instructorId, 'Cascade Course', slug],
    );
    const courseId = courseRes.rows[0].id as string;

    const moduleRes = await query(
      `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id`,
      [courseId, 'Module 1', 1],
    );
    const moduleId = moduleRes.rows[0].id as string;

    await query(
      `INSERT INTO lessons (module_id, title, content_type, position) VALUES ($1, $2, $3, $4)`,
      [moduleId, 'Lesson 1', 'video', 1],
    );

    await query('DELETE FROM courses WHERE id = $1', [courseId]);

    const modules = await query('SELECT id FROM modules WHERE id = $1', [moduleId]);
    expect(modules.rows).toHaveLength(0);

    const lessons = await query('SELECT id FROM lessons WHERE module_id = $1', [moduleId]);
    expect(lessons.rows).toHaveLength(0);
  });
});
