import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, generateSlug, query } from './db-helpers';

// Red phase: fails with "relation 'lessons' does not exist" until migration 0001 applied.

let instructorId: string;
let courseId: string;
let moduleId: string;

beforeAll(async () => {
  const userRes = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    ['Lesson Test Instructor', `lesson-instructor-${Date.now()}@test.com`, 'hash', 'instrutor'],
  );
  instructorId = userRes.rows[0].id as string;

  const courseRes = await query(
    `INSERT INTO courses (instructor_id, title, slug) VALUES ($1, $2, $3) RETURNING id`,
    [instructorId, 'Lessons Test Course', generateSlug('lessons-course')],
  );
  courseId = courseRes.rows[0].id as string;

  const modRes = await query(
    `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id`,
    [courseId, 'Lessons Test Module', 1],
  );
  moduleId = modRes.rows[0].id as string;
});

afterAll(async () => {
  await query('DELETE FROM courses WHERE id = $1', [courseId]);
  await query('DELETE FROM users WHERE id = $1', [instructorId]);
  await closePool();
});

describe('lessons table', () => {
  it('inserts a valid lesson', async () => {
    const res = await query(
      `INSERT INTO lessons (module_id, title, content_type, position)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [moduleId, 'Welcome Video', 'video', 1],
    );
    expect(res.rows[0].id).toBeDefined();
  });

  it('accepts all valid content_type values', async () => {
    const types = ['video', 'text', 'quiz'] as const;
    for (const [i, type] of types.entries()) {
      const res = await query(
        `INSERT INTO lessons (module_id, title, content_type, position)
         VALUES ($1, $2, $3, $4) RETURNING content_type`,
        [moduleId, `Lesson ${type}`, type, 10 + i],
      );
      expect(res.rows[0].content_type).toBe(type);
    }
  });

  it('rejects invalid content_type value', async () => {
    await expect(
      query(
        `INSERT INTO lessons (module_id, title, content_type, position)
         VALUES ($1, $2, $3, $4)`,
        [moduleId, 'Bad Lesson', 'assignment', 99],
      ),
    ).rejects.toThrow();
  });

  it('stores nullable duration', async () => {
    const res = await query(
      `INSERT INTO lessons (module_id, title, content_type, position, duration)
       VALUES ($1, $2, $3, $4, $5) RETURNING duration`,
      [moduleId, 'Timed Lesson', 'video', 20, 300],
    );
    expect(res.rows[0].duration).toBe(300);
  });

  it('rejects non-existent module_id', async () => {
    await expect(
      query(
        `INSERT INTO lessons (module_id, title, content_type, position)
         VALUES ($1, $2, $3, $4)`,
        ['00000000-0000-0000-0000-000000000000', 'Orphan Lesson', 'text', 1],
      ),
    ).rejects.toThrow();
  });
});
