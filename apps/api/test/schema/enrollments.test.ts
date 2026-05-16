import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, generateSlug, query } from './db-helpers';

// Red phase: fails with "relation 'enrollments' does not exist" until migration applied.

let studentId: string;
let instructorId: string;
let courseId: string;

beforeAll(async () => {
  const studentRes = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    ['Test Student', `student-${Date.now()}@test.com`, 'hash', 'aluno'],
  );
  studentId = studentRes.rows[0].id as string;

  const instructorRes = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    ['Enroll Test Instructor', `enroll-instructor-${Date.now()}@test.com`, 'hash', 'instrutor'],
  );
  instructorId = instructorRes.rows[0].id as string;

  const courseRes = await query(
    `INSERT INTO courses (instructor_id, title, slug, status) VALUES ($1, $2, $3, $4) RETURNING id`,
    [instructorId, 'Enrollment Test Course', generateSlug('enroll-course'), 'published'],
  );
  courseId = courseRes.rows[0].id as string;
});

afterAll(async () => {
  await query('DELETE FROM enrollments WHERE student_id = $1', [studentId]);
  await query('DELETE FROM courses WHERE id = $1', [courseId]);
  await query('DELETE FROM users WHERE id = $1', [studentId]);
  await query('DELETE FROM users WHERE id = $1', [instructorId]);
  await closePool();
});

describe('enrollments table', () => {
  it('creates a valid enrollment with default status active', async () => {
    const res = await query(
      `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING status`,
      [studentId, courseId],
    );
    expect(res.rows[0].status).toBe('active');
  });

  it('prevents duplicate enrollment for same student-course pair', async () => {
    await expect(
      query(
        `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)`,
        [studentId, courseId],
      ),
    ).rejects.toThrow(/unique/i);
  });

  it('accepts all valid status values', async () => {
    const student2Res = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Student 2', `student2-${Date.now()}@test.com`, 'hash', 'aluno'],
    );
    const student2Id = student2Res.rows[0].id as string;

    const res = await query(
      `INSERT INTO enrollments (student_id, course_id, status) VALUES ($1, $2, $3) RETURNING status`,
      [student2Id, courseId, 'completed'],
    );
    expect(res.rows[0].status).toBe('completed');

    await query('DELETE FROM users WHERE id = $1', [student2Id]);
  });

  it('cascades delete when course is deleted', async () => {
    const student3Res = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Student 3', `student3-${Date.now()}@test.com`, 'hash', 'aluno'],
    );
    const student3Id = student3Res.rows[0].id as string;

    const tempCourseRes = await query(
      `INSERT INTO courses (instructor_id, title, slug) VALUES ($1, $2, $3) RETURNING id`,
      [instructorId, 'Temp Course', generateSlug('temp-cascade')],
    );
    const tempCourseId = tempCourseRes.rows[0].id as string;

    await query(
      `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)`,
      [student3Id, tempCourseId],
    );

    await query('DELETE FROM courses WHERE id = $1', [tempCourseId]);

    const enrollments = await query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [student3Id, tempCourseId],
    );
    expect(enrollments.rows).toHaveLength(0);

    await query('DELETE FROM users WHERE id = $1', [student3Id]);
  });

  it('cascades delete when student user is deleted', async () => {
    const student4Res = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Student 4', `student4-${Date.now()}@test.com`, 'hash', 'aluno'],
    );
    const student4Id = student4Res.rows[0].id as string;

    await query(
      `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)`,
      [student4Id, courseId],
    );

    await query('DELETE FROM users WHERE id = $1', [student4Id]);

    const enrollments = await query(
      'SELECT id FROM enrollments WHERE student_id = $1',
      [student4Id],
    );
    expect(enrollments.rows).toHaveLength(0);
  });
});
