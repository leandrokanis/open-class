/**
 * Seed: Course Details page test data
 * Inserts: category, instructor, course, 4 modules, 48 lessons,
 *          student user, enrollment, 30 completed lessons + 1 started.
 *
 * Run: cd apps/api && pnpm seed
 * Idempotent: uses ON CONFLICT DO NOTHING or skips if exists.
 */
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcrypt';
import * as schema from '@open-class/db';
import { eq, and } from 'drizzle-orm';

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://openclass:openclass@localhost:5432/openclass';

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

// ── Lesson plan ──────────────────────────────────────────────────────────────
const MODULE_PLAN = [
  {
    title: 'Fundamentos do JavaScript',
    lessons: [
      { title: 'Introdução ao JavaScript', duration: 480 },
      { title: 'Variáveis, Tipos e Operadores', duration: 900 },
      { title: 'Funções e Escopo', duration: 1320 },
      { title: 'Arrays e Objetos', duration: 1080 },
      { title: 'Estruturas de Controle', duration: 780 },
      { title: 'Loops e Iteração', duration: 960 },
      { title: 'Hoisting e Closures', duration: 1200 },
      { title: 'This e Contexto', duration: 1020 },
      { title: 'Prototype e Herança', duration: 1380 },
      { title: 'ES6: Arrow Functions e Destructuring', duration: 900 },
      { title: 'ES6: Spread, Rest e Módulos', duration: 840 },
      { title: 'Exercícios Práticos — Módulo 1', duration: 1800 },
    ],
  },
  {
    title: 'DOM e Eventos',
    lessons: [
      { title: 'Introdução ao DOM', duration: 600 },
      { title: 'Selecionando Elementos', duration: 720 },
      { title: 'Manipulando Conteúdo', duration: 840 },
      { title: 'Criando e Removendo Nós', duration: 780 },
      { title: 'Event Listeners', duration: 900 },
      { title: 'Delegação de Eventos', duration: 1020 },
      { title: 'Formulários e Validação', duration: 1200 },
      { title: 'Storage: localStorage e sessionStorage', duration: 780 },
      { title: 'Intersection Observer', duration: 960 },
      { title: 'Projeto — Lista de Tarefas', duration: 2400 },
    ],
  },
  {
    title: 'Async e Promises',
    lessons: [
      { title: 'Callbacks e o Problema do Callback Hell', duration: 720 },
      { title: 'Promises — Fundamentos', duration: 900 },
      { title: 'Promise.all e Promise.race', duration: 780 },
      { title: 'Async/Await — Sintaxe', duration: 840 },
      { title: 'Tratamento de Erros Assíncronos', duration: 960 },
      { title: 'Fetch API — GET e POST', duration: 1080 },
      { title: 'Axios vs Fetch', duration: 720 },
      { title: 'Requisições em Paralelo', duration: 900 },
      { title: 'Cancelamento de Requisições (AbortController)', duration: 780 },
      { title: 'Cache e Memoização', duration: 1020 },
      { title: 'WebSockets — Introdução', duration: 1200 },
      { title: 'Server-Sent Events', duration: 840 },
      { title: 'Projeto — App de Clima em Tempo Real', duration: 2700 },
      { title: 'Revisão e Exercícios — Módulo 3', duration: 1500 },
    ],
  },
  {
    title: 'Projetos Práticos',
    lessons: [
      { title: 'Planejamento de Projeto Real', duration: 600 },
      { title: 'Setup do Projeto com Vite', duration: 900 },
      { title: 'Arquitetura de Componentes', duration: 1200 },
      { title: 'Gerenciamento de Estado com Vanilla JS', duration: 1080 },
      { title: 'Integração com API REST', duration: 1320 },
      { title: 'Autenticação JWT no Frontend', duration: 1500 },
      { title: 'Formulários Avançados e UX', duration: 960 },
      { title: 'Performance e Lazy Loading', duration: 1020 },
      { title: 'Testes com Jest', duration: 1380 },
      { title: 'Deploy com GitHub Actions', duration: 1200 },
      { title: 'Projeto Final — Parte 1', duration: 3600 },
      { title: 'Projeto Final — Parte 2', duration: 3600 },
    ],
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ── 1. Category ──────────────────────────────────────────────────────────
  console.log('  → category');
  let [category] = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.slug, 'desenvolvimento-web'))
    .limit(1);

  if (!category) {
    [category] = await db
      .insert(schema.categories)
      .values({
        name:        'Desenvolvimento Web',
        slug:        'desenvolvimento-web',
        description: 'HTML, CSS, JavaScript, TypeScript e frameworks modernos.',
        position:    1,
      })
      .returning();
  }

  // ── 2. Instructor ────────────────────────────────────────────────────────
  console.log('  → instructor');
  let [instructor] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'carlos.mendes@openclass.dev'))
    .limit(1);

  if (!instructor) {
    [instructor] = await db
      .insert(schema.users)
      .values({
        name:         'Carlos Mendes',
        email:        'carlos.mendes@openclass.dev',
        passwordHash,
        role:         'instrutor',
        bio:          'Desenvolvedor web com 10+ anos de experiência.',
        isActive:     true,
      })
      .returning();
  }

  // ── 3. Course ────────────────────────────────────────────────────────────
  console.log('  → course');
  let [course] = await db
    .select()
    .from(schema.courses)
    .where(eq(schema.courses.slug, 'javascript-zero-avancado-2025'))
    .limit(1);

  if (!course) {
    [course] = await db
      .insert(schema.courses)
      .values({
        instructorId:     instructor.id,
        categoryId:       category.id,
        title:            'JavaScript do Zero ao Avançado: Guia Completo 2025',
        slug:             'javascript-zero-avancado-2025',
        shortDescription: 'Domine JavaScript do absoluto zero até conceitos avançados como async/await, closures e padrões de projeto com projetos reais.',
        description:      'Neste curso completo você vai sair do zero e dominar JavaScript de forma estruturada — de variáveis e funções até Promises, async/await, manipulação do DOM e padrões de projeto usados no mercado. Cada módulo inclui projetos práticos que você pode adicionar ao seu portfólio.',
        level:            'intermediate',
        status:           'published',
      })
      .returning();
  }

  // ── 4. Modules & Lessons ────────────────────────────────────────────────
  console.log('  → modules and lessons');
  const allLessonIds: string[] = [];

  for (let mi = 0; mi < MODULE_PLAN.length; mi++) {
    const modulePlan = MODULE_PLAN[mi];

    let [mod] = await db
      .select()
      .from(schema.modules)
      .where(
        and(
          eq(schema.modules.courseId, course.id),
          eq(schema.modules.position, mi + 1),
        ),
      )
      .limit(1);

    if (!mod) {
      [mod] = await db
        .insert(schema.modules)
        .values({
          courseId:   course.id,
          title:      modulePlan.title,
          position:   mi + 1,
          visibility: 'visible',
        })
        .returning();
    }

    for (let li = 0; li < modulePlan.lessons.length; li++) {
      const lessonPlan = modulePlan.lessons[li];

      let [lesson] = await db
        .select()
        .from(schema.lessons)
        .where(
          and(
            eq(schema.lessons.moduleId, mod.id),
            eq(schema.lessons.position, li + 1),
          ),
        )
        .limit(1);

      if (!lesson) {
        [lesson] = await db
          .insert(schema.lessons)
          .values({
            moduleId:    mod.id,
            title:       lessonPlan.title,
            contentType: 'video',
            youtubeUrl:  `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
            duration:    lessonPlan.duration,
            position:    li + 1,
            visibility:  'visible',
          })
          .returning();
      }

      allLessonIds.push(lesson.id);
    }
  }

  console.log(`  ✓ ${allLessonIds.length} lessons ready`);

  // ── 5. Student ───────────────────────────────────────────────────────────
  console.log('  → student');
  let [student] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'aluno@openclass.dev'))
    .limit(1);

  if (!student) {
    [student] = await db
      .insert(schema.users)
      .values({
        name:         'Aluno Teste',
        email:        'aluno@openclass.dev',
        passwordHash,
        role:         'aluno',
        isActive:     true,
      })
      .returning();
  }

  // ── 6. Enrollment ─────────────────────────────────────────────────────────
  console.log('  → enrollment');
  const existingEnrollment = await db.query.enrollments.findFirst({
    where: and(
      eq(schema.enrollments.studentId, student.id),
      eq(schema.enrollments.courseId, course.id),
    ),
  });

  if (!existingEnrollment) {
    await db.insert(schema.enrollments).values({
      studentId: student.id,
      courseId:  course.id,
      status:    'active',
    });
  }

  // ── 7. Lesson Progress (30 completed + lesson 31 started) ───────────────
  console.log('  → lesson progress');
  const completedLessonIds = allLessonIds.slice(0, 30);
  const startedLessonId    = allLessonIds[30];

  for (const lessonId of completedLessonIds) {
    await db
      .insert(schema.lessonProgress)
      .values({
        studentId:   student.id,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  // Lesson 31: started but not completed (most recent updatedAt for "last accessed")
  await db
    .insert(schema.lessonProgress)
    .values({
      studentId:   student.id,
      lessonId:    startedLessonId,
      isCompleted: false,
      completedAt: null,
    })
    .onConflictDoNothing();

  console.log('✅ Seed completed!');
  console.log(`   Course slug: javascript-zero-avancado-2025`);
  console.log(`   Student: aluno@openclass.dev / password123`);
  console.log(`   Instructor: carlos.mendes@openclass.dev / password123`);
  console.log(`   Progress: 30/48 lessons completed`);
}

main()
  .catch(console.error)
  .finally(() => pool.end());
