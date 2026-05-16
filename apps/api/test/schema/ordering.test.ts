import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, generateSlug, query } from './db-helpers';

// Red phase: fails until migration is applied (tables don't exist).
// Green phase: verifies ordering queries return rows in position ASC order.

let instructorId: string;
let courseId: string;
let moduleId: string;

beforeAll(async () => {
  const userRes = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    ['Order Test Instructor', `order-instructor-${Date.now()}@test.com`, 'hash', 'instrutor'],
  );
  instructorId = userRes.rows[0].id as string;

  const courseRes = await query(
    `INSERT INTO courses (instructor_id, title, slug) VALUES ($1, $2, $3) RETURNING id`,
    [instructorId, 'Ordering Test Course', generateSlug('ordering-course')],
  );
  courseId = courseRes.rows[0].id as string;

  const modRes = await query(
    `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id`,
    [courseId, 'Ordering Test Module', 1],
  );
  moduleId = modRes.rows[0].id as string;
});

afterAll(async () => {
  await query('DELETE FROM courses WHERE id = $1', [courseId]);
  await query('DELETE FROM users WHERE id = $1', [instructorId]);
  await closePool();
});

describe('module ordering', () => {
  it('returns modules in position ASC order', async () => {
    const mod2Res = await query(
      `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id`,
      [courseId, 'Module 3', 3],
    );
    const mod3Res = await query(
      `INSERT INTO modules (course_id, title, position) VALUES ($1, $2, $3) RETURNING id`,
      [courseId, 'Module 2', 2],
    );

    const mod2Id = mod2Res.rows[0].id as string;
    const mod3Id = mod3Res.rows[0].id as string;

    const res = await query(
      `SELECT id, position FROM modules WHERE course_id = $1 ORDER BY position ASC, id ASC`,
      [courseId],
    );

    const positions = res.rows.map((r) => r.position as number);
    const sorted = [...positions].sort((a, b) => a - b);
    expect(positions).toEqual(sorted);

    await query('DELETE FROM modules WHERE id = ANY($1)', [[mod2Id, mod3Id]]);
  });
});

describe('lesson ordering', () => {
  it('returns lessons in position ASC order within a module', async () => {
    await query(
      `INSERT INTO lessons (module_id, title, content_type, position) VALUES ($1, $2, $3, $4)`,
      [moduleId, 'Lesson 3', 'quiz', 3],
    );
    await query(
      `INSERT INTO lessons (module_id, title, content_type, position) VALUES ($1, $2, $3, $4)`,
      [moduleId, 'Lesson 1', 'video', 1],
    );
    await query(
      `INSERT INTO lessons (module_id, title, content_type, position) VALUES ($1, $2, $3, $4)`,
      [moduleId, 'Lesson 2', 'text', 2],
    );

    const res = await query(
      `SELECT position FROM lessons WHERE module_id = $1 ORDER BY position ASC, id ASC`,
      [moduleId],
    );

    const positions = res.rows.map((r) => r.position as number);
    expect(positions).toEqual([1, 2, 3]);
  });
});
