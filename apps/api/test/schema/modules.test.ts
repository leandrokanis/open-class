import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, generateSlug, query } from './db-helpers';

// Red phase: fails with "relation 'modules' does not exist" until migration 0001 applied.

let instructorId: string;
let courseId: string;

beforeAll(async () => {
  const userRes = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    ['Module Test Instructor', `mod-instructor-${Date.now()}@test.com`, 'hash', 'instrutor'],
  );
  instructorId = userRes.rows[0].id as string;

  const courseRes = await query(
    `INSERT INTO courses (instructor_id, title, slug) VALUES ($1, $2, $3) RETURNING id`,
    [instructorId, 'Modules Test Course', generateSlug('modules-course')],
  );
  courseId = courseRes.rows[0].id as string;
});

afterAll(async () => {
  await query('DELETE FROM courses WHERE id = $1', [courseId]);
  await query('DELETE FROM users WHERE id = $1', [instructorId]);
  await closePool();
});

describe('modules table', () => {
  it('inserts a valid module', async () => {
    const res = await query(
      `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id`,
      [courseId, 'Introduction', 1],
    );
    expect(res.rows[0].id).toBeDefined();
  });

  it('stores position as integer', async () => {
    const res = await query(
      `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING position`,
      [courseId, 'Chapter 2', 2],
    );
    expect(res.rows[0].position).toBe(2);
  });

  it('rejects null course_id (FK violation)', async () => {
    await expect(
      query(`INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3)`, [
        '00000000-0000-0000-0000-000000000000',
        'Orphan Module',
        1,
      ]),
    ).rejects.toThrow();
  });

  it('cascades delete to lessons when module is deleted', async () => {
    const modRes = await query(
      `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id`,
      [courseId, 'Cascade Module', 99],
    );
    const moduleId = modRes.rows[0].id as string;

    await query(
      `INSERT INTO lessons (module_id, title, content_type, position) VALUES ($1, $2, $3, $4)`,
      [moduleId, 'Cascade Lesson', 'text', 1],
    );

    await query('DELETE FROM modules WHERE id = $1', [moduleId]);

    const lessons = await query('SELECT id FROM lessons WHERE module_id = $1', [moduleId]);
    expect(lessons.rows).toHaveLength(0);
  });
});
