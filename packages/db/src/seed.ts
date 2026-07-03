import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, like, or, inArray } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as schema from './index';

const {
  categories, courses, modules, lessons, users, enrollments, lessonProgress,
  cohorts, cohortModuleSchedules, cohortEnrollments, extraUnlockCelebrations, lessonCohorts,
} = schema;

// Carrega DATABASE_URL do .env da raiz do repo quando não está no ambiente,
// para que `pnpm seed` funcione direto, sem precisar exportar a variável antes.
function loadDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const rel of ['../../.env', '../../../.env']) {
    try {
      const content = readFileSync(join(__dirname, rel), 'utf8');
      const match = content.match(/^DATABASE_URL=(.*)$/m);
      if (match) return match[1].trim().replace(/^["']|["']$/g, '');
    } catch { /* segue para o próximo caminho */ }
  }
  return 'postgresql://openclass:openclass@localhost:5432/openclass';
}
const DATABASE_URL = loadDatabaseUrl();

// Domínio dedicado: identifica todos os usuários de seed para um reset seguro.
// Deletar esses usuários limpa em cascata cursos, matrículas, turmas e progresso,
// sem tocar em contas reais (ex.: seu admin) nem nas categorias.
const SEED_DOMAIN = 'seed.openclass.dev';

// Senha de todos os usuários de seed: "senha123" (bcrypt, rounds 12).
const PASSWORD_HASH = '$2b$12$9oXrM8KnOlkdRgZ2VmpgreC7nQcXMgaBNMhUVw4jGLAi1ifHyIZoO';
const SEED_PASSWORD = 'senha123';

// ── PRNG com semente fixa: dados "aleatórios" reprodutíveis a cada execução ────
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260703);
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const chance = (p: number) => rng() < p;
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}
const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000);

// Vídeos reais (freeCodeCamp e afins) — o player renderiza de verdade no dev.
const YT_IDS = [
  'PkZNo7MFNFg', 'Ke90Tje7VS0', 'rfscVS0vtbw', 'w7ejDZ8SWv8',
  '1Rs2ND1ryYc', 'jS4aFq5-91M', 'zJSY8tbf_ys', 'pQN-pnXPaVg',
];
const ytFor = (i: number) => YT_IDS[i % YT_IDS.length];

// ── Pessoas ────────────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Ana', 'Bruno', 'Carla', 'Daniel', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique',
  'Isabela', 'João', 'Larissa', 'Lucas', 'Mariana', 'Mateus', 'Natália', 'Otávio',
  'Patrícia', 'Rafael', 'Sofia', 'Thiago', 'Vitória', 'William', 'Beatriz', 'Caio',
  'Débora', 'Enzo', 'Fernanda', 'Gustavo', 'Helena', 'Igor', 'Júlia', 'Kevin',
  'Letícia', 'Marcelo', 'Nicole', 'Paulo', 'Renata', 'Samuel', 'Tatiana', 'Vinícius',
];
const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Rodrigues',
  'Almeida', 'Nascimento', 'Carvalho', 'Araújo', 'Ribeiro', 'Fernandes', 'Gomes',
  'Martins', 'Rocha', 'Barbosa', 'Cardoso', 'Teixeira', 'Moraes', 'Cavalcanti',
];

const CATEGORIES = [
  { name: 'Dev Web', slug: 'dev-web', description: 'Desenvolvimento web front-end e back-end', position: 0 },
  { name: 'Design', slug: 'design', description: 'UI/UX, prototipação e design thinking', position: 1 },
  { name: 'Dados', slug: 'dados', description: 'Ciência de dados, ML e análise', position: 2 },
  { name: 'DevOps', slug: 'devops', description: 'Infraestrutura, CI/CD e cloud', position: 3 },
  { name: 'Mobile', slug: 'mobile', description: 'Desenvolvimento iOS e Android', position: 4 },
];

const INSTRUCTORS = [
  { name: 'Carlos Mendes', bio: 'Eng. de software há 12 anos, apaixonado por JavaScript.' },
  { name: 'Marina Costa', bio: 'Especialista em React e front-end moderno.' },
  { name: 'Ana Lima', bio: 'Product designer e educadora em Design Systems.' },
  { name: 'Rodrigo Neves', bio: 'Cientista de dados e professor de Machine Learning.' },
  { name: 'Pedro Alves', bio: 'SRE e entusiasta de Kubernetes e cloud.' },
  { name: 'Juliana Ferreira', bio: 'Mobile lead, Flutter e React Native.' },
];

type LessonSeed = { title: string; duration: number; isExtra?: boolean };
type ModuleSeed = { title: string; lessons: LessonSeed[] };
type CourseSeed = {
  instructorIdx: number; categorySlug: string; title: string; slug: string;
  shortDescription: string; description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  accessMode: 'on_demand' | 'cohort' | 'both';
  rating: string; reviewCount: number; modules: ModuleSeed[];
};

const COURSES_SEED: CourseSeed[] = [
  {
    instructorIdx: 0, categorySlug: 'dev-web', accessMode: 'both',
    title: 'JavaScript do Zero ao Avançado: Guia Completo 2026',
    slug: 'javascript-zero-avancado-2026',
    shortDescription: 'Domine JavaScript do básico ao avançado com projetos reais.',
    description: 'Um curso completo de JavaScript moderno: fundamentos sólidos, ES6+, assíncrono e boas práticas, com projetos guiados.',
    level: 'intermediate', rating: '4.8', reviewCount: 1243,
    modules: [
      { title: 'Fundamentos', lessons: [
        { title: 'Variáveis e Tipos', duration: 720 },
        { title: 'Funções e Escopo', duration: 960 },
        { title: 'Arrays e Objetos', duration: 1080 },
        { title: 'Desafio: Refatorando um script legado', duration: 900, isExtra: true },
      ]},
      { title: 'JavaScript Moderno', lessons: [
        { title: 'ES6+ Features', duration: 840 },
        { title: 'Promises e Async/Await', duration: 1200 },
        { title: 'Módulos', duration: 600 },
        { title: 'Bônus: Padrões avançados de assíncrono', duration: 1100, isExtra: true },
      ]},
    ],
  },
  {
    instructorIdx: 1, categorySlug: 'dev-web', accessMode: 'cohort',
    title: 'React na Prática: Hooks, Context e React Query',
    slug: 'react-pratica-hooks-context-query',
    shortDescription: 'Construa aplicações React modernas com as melhores práticas.',
    description: 'Turmas guiadas de React: hooks, gerenciamento de estado, data fetching com React Query e arquitetura de componentes.',
    level: 'advanced', rating: '4.9', reviewCount: 902,
    modules: [
      { title: 'Componentes e Hooks', lessons: [
        { title: 'JSX e componentes', duration: 780 },
        { title: 'useState e useEffect', duration: 1020 },
        { title: 'Hooks customizados', duration: 900 },
      ]},
      { title: 'Estado e Dados', lessons: [
        { title: 'Context API', duration: 840 },
        { title: 'React Query', duration: 1260 },
        { title: 'Estudo de caso: dashboard', duration: 1400, isExtra: true },
      ]},
    ],
  },
  {
    instructorIdx: 2, categorySlug: 'design', accessMode: 'on_demand',
    title: 'Design System: Do Zero à Biblioteca de Componentes',
    slug: 'design-system-zero-biblioteca',
    shortDescription: 'Crie um Design System completo com tokens, componentes e documentação.',
    description: 'Do conceito à publicação: tokens, componentes acessíveis e documentação viva no Storybook.',
    level: 'intermediate', rating: '4.6', reviewCount: 213,
    modules: [
      { title: 'Fundamentos', lessons: [
        { title: 'Tokens de design', duration: 780 },
        { title: 'Tipografia e espaçamento', duration: 660 },
      ]},
      { title: 'Componentes', lessons: [
        { title: 'Botões e inputs', duration: 900 },
        { title: 'Cards e modais', duration: 840 },
        { title: 'Publicando no Storybook', duration: 720 },
      ]},
    ],
  },
  {
    instructorIdx: 3, categorySlug: 'dados', accessMode: 'both',
    title: 'Machine Learning com Scikit-Learn',
    slug: 'machine-learning-scikit-learn',
    shortDescription: 'Aprenda os principais algoritmos de ML com Python.',
    description: 'Machine Learning aplicado: pré-processamento, regressão, classificação e clustering com Scikit-Learn.',
    level: 'advanced', rating: '4.8', reviewCount: 501,
    modules: [
      { title: 'Conceitos de ML', lessons: [
        { title: 'Tipos de aprendizado', duration: 720 },
        { title: 'Pré-processamento', duration: 900 },
      ]},
      { title: 'Algoritmos', lessons: [
        { title: 'Regressão linear', duration: 960 },
        { title: 'Classificação', duration: 1080 },
        { title: 'Clustering', duration: 840 },
        { title: 'Projeto: prevendo preços de imóveis', duration: 1500, isExtra: true },
      ]},
    ],
  },
  {
    instructorIdx: 4, categorySlug: 'devops', accessMode: 'on_demand',
    title: 'Kubernetes na Prática: Deploy em Produção',
    slug: 'kubernetes-pratica-deploy-producao',
    shortDescription: 'Orquestre containers com Kubernetes e deploy em cloud.',
    description: 'Kubernetes do básico ao deploy em produção: pods, services, Helm e monitoramento.',
    level: 'advanced', rating: '4.7', reviewCount: 256,
    modules: [
      { title: 'Fundamentos', lessons: [
        { title: 'Pods e Deployments', duration: 900 },
        { title: 'Services e Ingress', duration: 840 },
        { title: 'ConfigMaps e Secrets', duration: 720 },
      ]},
      { title: 'Produção', lessons: [
        { title: 'Helm Charts', duration: 960 },
        { title: 'Monitoramento', duration: 780 },
      ]},
    ],
  },
  {
    instructorIdx: 5, categorySlug: 'mobile', accessMode: 'on_demand',
    title: 'Flutter Mobile: Apps Nativos do Zero',
    slug: 'flutter-mobile-apps-nativos',
    shortDescription: 'Crie aplicativos iOS e Android com Flutter e Dart.',
    description: 'Desenvolvimento mobile com Flutter: widgets, navegação, estado e publicação nas lojas.',
    level: 'beginner', rating: '4.7', reviewCount: 384,
    modules: [
      { title: 'Dart e Flutter Basics', lessons: [
        { title: 'Configurando o ambiente', duration: 600 },
        { title: 'Widgets fundamentais', duration: 840 },
        { title: 'Layout com Column e Row', duration: 780 },
      ]},
      { title: 'Navegação e Estado', lessons: [
        { title: 'Navigator 2.0', duration: 960 },
        { title: 'Provider e state management', duration: 1200 },
      ]},
    ],
  },
  {
    instructorIdx: 1, categorySlug: 'dev-web', accessMode: 'on_demand',
    title: 'CSS Moderno: Grid, Flexbox e Animações',
    slug: 'css-moderno-grid-flexbox-animacoes',
    shortDescription: 'Domine CSS moderno com layouts responsivos e animações.',
    description: 'Layouts responsivos com Flexbox e Grid, mais animações fluidas com transitions e keyframes.',
    level: 'beginner', rating: '4.4', reviewCount: 647,
    modules: [
      { title: 'Layouts', lessons: [
        { title: 'Flexbox do zero', duration: 840 },
        { title: 'CSS Grid', duration: 960 },
        { title: 'Responsividade', duration: 720 },
      ]},
      { title: 'Animações', lessons: [
        { title: 'Transitions', duration: 600 },
        { title: 'Keyframe animations', duration: 780 },
      ]},
    ],
  },
];

// Turmas: por slug de curso. status é derivado do período + closedAt.
type CohortSeed = {
  courseSlug: string; name: string;
  startOffsetDays: number; durationDays: number; closed?: boolean;
  seats: number; enrollRatio: number;
  // liberação de módulos relativa ao início da turma (por índice de módulo)
  moduleReleaseOffsets: number[];
  exclusive?: { moduleIdx: number; title: string; duration: number };
};

const COHORTS_SEED: CohortSeed[] = [
  {
    courseSlug: 'react-pratica-hooks-context-query',
    name: 'React Turma Julho/2026', startOffsetDays: -10, durationDays: 30,
    seats: 30, enrollRatio: 0.7, moduleReleaseOffsets: [0, 14],
    exclusive: { moduleIdx: 1, title: 'Mentoria ao vivo: revisão de código', duration: 2400 },
  },
  {
    courseSlug: 'react-pratica-hooks-context-query',
    name: 'React Turma Agosto/2026 (em breve)', startOffsetDays: 20, durationDays: 30,
    seats: 25, enrollRatio: 0.2, moduleReleaseOffsets: [0, 14],
  },
  {
    courseSlug: 'javascript-zero-avancado-2026',
    name: 'JS Intensivo Maio/2026 (encerrada)', startOffsetDays: -60, durationDays: 30, closed: true,
    seats: 40, enrollRatio: 0.9, moduleReleaseOffsets: [0, 10],
  },
  {
    courseSlug: 'machine-learning-scikit-learn',
    name: 'ML Turma Julho/2026', startOffsetDays: -5, durationDays: 45,
    seats: 20, enrollRatio: 0.75, moduleReleaseOffsets: [0, 21],
    exclusive: { moduleIdx: 1, title: 'Dataset exclusivo: competição interna', duration: 1800 },
  },
];

async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool, { schema });
  const log = (s: string) => console.log(s);

  log('🌱 Seed open-class — dados realistas de desenvolvimento\n');

  // ── Reset: remove dados de seed anteriores; cascata limpa o resto ────────────
  // Cobre este seed (@seed.openclass.dev) e o seed legado (@openclass.dev), além
  // de qualquer curso com os slugs conhecidos (independente de quem o criou).
  log('🧹 Limpando dados de seed anteriores...');
  const slugs = COURSES_SEED.map((c) => c.slug);
  await db.delete(courses).where(inArray(courses.slug, slugs));
  const deleted = await db.delete(users)
    .where(or(like(users.email, `%@${SEED_DOMAIN}`), like(users.email, '%@openclass.dev')))
    .returning({ id: users.id });
  log(`   ${deleted.length} usuário(s) de seed e cursos anteriores removidos (cascata).\n`);

  // ── Categorias (upsert — preserva as existentes) ─────────────────────────────
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, cat.slug));
    if (existing.length > 0) categoryMap.set(cat.slug, existing[0].id);
    else {
      const [row] = await db.insert(categories).values(cat).returning({ id: categories.id });
      categoryMap.set(cat.slug, row.id);
    }
  }
  log(`📁 ${CATEGORIES.length} categorias prontas.`);

  // ── Admin + instrutores + alunos ─────────────────────────────────────────────
  const [admin] = await db.insert(users).values({
    name: 'Admin Seed', email: `admin@${SEED_DOMAIN}`, passwordHash: PASSWORD_HASH,
    role: 'admin', bio: 'Conta de administração de demonstração.',
  }).returning({ id: users.id });

  const instructorIds: string[] = [];
  for (let i = 0; i < INSTRUCTORS.length; i++) {
    const inst = INSTRUCTORS[i];
    const email = `instrutor${i + 1}@${SEED_DOMAIN}`;
    const [row] = await db.insert(users).values({
      name: inst.name, email, passwordHash: PASSWORD_HASH, role: 'instrutor', bio: inst.bio,
    }).returning({ id: users.id });
    instructorIds.push(row.id);
  }

  const STUDENT_COUNT = 50;
  const studentIds: string[] = [];
  const usedEmails = new Set<string>();
  for (let i = 0; i < STUDENT_COUNT; i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const local = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]+/g, '.');
    let email = `${local}@${SEED_DOMAIN}`;
    if (usedEmails.has(email)) email = `${local}.${i}@${SEED_DOMAIN}`;
    usedEmails.add(email);
    const [row] = await db.insert(users).values({
      name, email, passwordHash: PASSWORD_HASH, role: 'aluno',
    }).returning({ id: users.id });
    studentIds.push(row.id);
  }
  log(`👤 1 admin, ${INSTRUCTORS.length} instrutores e ${STUDENT_COUNT} alunos criados (senha: "${SEED_PASSWORD}").`);

  // ── Cursos, módulos e aulas ──────────────────────────────────────────────────
  interface CourseRec {
    id: string; slug: string;
    modules: { id: string; normalLessonIds: string[]; extraLessonIds: string[] }[];
  }
  const courseRecs = new Map<string, CourseRec>();
  let ytCounter = 0;

  for (const cs of COURSES_SEED) {
    const [course] = await db.insert(courses).values({
      instructorId: instructorIds[cs.instructorIdx],
      categoryId: categoryMap.get(cs.categorySlug)!,
      title: cs.title, slug: cs.slug, shortDescription: cs.shortDescription, description: cs.description,
      level: cs.level, status: 'published', accessMode: cs.accessMode,
      rating: cs.rating, reviewCount: cs.reviewCount,
    }).returning({ id: courses.id });

    const rec: CourseRec = { id: course.id, slug: cs.slug, modules: [] };
    let modPos = 1;
    for (const mod of cs.modules) {
      const [m] = await db.insert(modules).values({
        courseId: course.id, title: mod.title, position: modPos++, visibility: 'visible',
      }).returning({ id: modules.id });

      const normalLessonIds: string[] = [];
      const extraLessonIds: string[] = [];
      let normalPos = 1, extraPos = 1;
      for (const l of mod.lessons) {
        const vid = ytFor(ytCounter++);
        const [row] = await db.insert(lessons).values({
          moduleId: m.id, title: l.title,
          youtubeUrl: `https://www.youtube.com/watch?v=${vid}`, youtubeVideoId: vid,
          contentType: 'video', duration: l.duration,
          position: l.isExtra ? extraPos++ : normalPos++,
          visibility: 'visible', isExtra: !!l.isExtra,
        }).returning({ id: lessons.id });
        (l.isExtra ? extraLessonIds : normalLessonIds).push(row.id);
      }
      rec.modules.push({ id: m.id, normalLessonIds, extraLessonIds });
    }
    courseRecs.set(cs.slug, rec);
  }
  log(`📚 ${COURSES_SEED.length} cursos com módulos, aulas e conteúdo bônus.`);

  // Marca aulas normais como concluídas conforme um perfil de engajamento;
  // celebra e às vezes assiste as extras dos módulos totalmente concluídos.
  // Retorna a fração de conclusão (0..1) para derivar o status da matrícula.
  async function completeProgress(studentId: string, rec: CourseRec, ratioOfModulesUnlocked = 1) {
    const profile = rng();
    let targetFraction: number;
    if (profile < 0.2) targetFraction = 1;                       // concluiu tudo
    else if (profile < 0.7) targetFraction = rng() * 0.7 + 0.1;  // parcial
    else targetFraction = rng() * 0.15;                          // mal começou

    const unlockedModules = rec.modules.slice(0, Math.max(1, Math.round(rec.modules.length * ratioOfModulesUnlocked)));
    const allNormal = unlockedModules.flatMap((m) => m.normalLessonIds);
    const toComplete = Math.round(allNormal.length * targetFraction);

    for (let i = 0; i < toComplete; i++) {
      const when = daysFromNow(-randInt(1, 40));
      await db.insert(lessonProgress).values({
        studentId, lessonId: allNormal[i], isCompleted: true, completedAt: when, createdAt: when, updatedAt: when,
      }).onConflictDoNothing();
    }

    for (const m of unlockedModules) {
      const allDone = m.normalLessonIds.length > 0 && m.normalLessonIds.every((id) => allNormal.indexOf(id) < toComplete);
      if (allDone && m.extraLessonIds.length > 0) {
        await db.insert(extraUnlockCelebrations).values({ studentId, moduleId: m.id }).onConflictDoNothing();
        if (chance(0.5)) {
          const when = daysFromNow(-randInt(1, 20));
          await db.insert(lessonProgress).values({
            studentId, lessonId: m.extraLessonIds[0], isCompleted: true, completedAt: when, createdAt: when, updatedAt: when,
          }).onConflictDoNothing();
        }
      }
    }
    return targetFraction;
  }

  // ── Matrículas on-demand + progresso ─────────────────────────────────────────
  const onDemandCourses = COURSES_SEED.filter((c) => c.accessMode !== 'cohort').map((c) => courseRecs.get(c.slug)!);
  let enrollmentCount = 0, completedCount = 0;
  for (const studentId of studentIds) {
    const n = randInt(1, 4);
    for (const rec of sample(onDemandCourses, n)) {
      const frac = await completeProgress(studentId, rec, 1);
      const status = frac >= 0.999 ? 'completed' : 'active';
      const when = daysFromNow(-randInt(5, 90));
      await db.insert(enrollments).values({
        studentId, courseId: rec.id, status, enrolledAt: when,
      }).onConflictDoNothing();
      enrollmentCount++;
      if (status === 'completed') completedCount++;
    }
  }
  log(`🎓 ${enrollmentCount} matrículas on-demand (${completedCount} concluídas) com progresso variado.`);

  // ── Turmas: cronograma, inscrições, exclusivas e progresso ───────────────────
  let cohortEnrollCount = 0, exclusiveCount = 0;
  for (const cohSeed of COHORTS_SEED) {
    const rec = courseRecs.get(cohSeed.courseSlug)!;
    const start = daysFromNow(cohSeed.startOffsetDays);
    const end = daysFromNow(cohSeed.startOffsetDays + cohSeed.durationDays);
    const [cohort] = await db.insert(cohorts).values({
      courseId: rec.id, name: cohSeed.name,
      enrollmentStart: start, enrollmentEnd: end, seats: cohSeed.seats,
      closedAt: cohSeed.closed ? daysFromNow(cohSeed.startOffsetDays + 5) : null,
    }).returning({ id: cohorts.id });

    // cronograma de liberação por módulo
    for (let mi = 0; mi < rec.modules.length; mi++) {
      const offset = cohSeed.moduleReleaseOffsets[mi] ?? cohSeed.moduleReleaseOffsets[cohSeed.moduleReleaseOffsets.length - 1] ?? 0;
      await db.insert(cohortModuleSchedules).values({
        cohortId: cohort.id, moduleId: rec.modules[mi].id,
        availableFrom: daysFromNow(cohSeed.startOffsetDays + offset),
      }).onConflictDoNothing();
    }

    // aula exclusiva da turma (vínculo many-to-many via lesson_cohorts)
    if (cohSeed.exclusive) {
      const m = rec.modules[cohSeed.exclusive.moduleIdx];
      const vid = ytFor(ytCounter++);
      const [exclusive] = await db.insert(lessons).values({
        moduleId: m.id, title: cohSeed.exclusive.title,
        youtubeUrl: `https://www.youtube.com/watch?v=${vid}`, youtubeVideoId: vid,
        contentType: 'video', duration: cohSeed.exclusive.duration,
        position: 100, visibility: 'visible', isExtra: false,
      }).returning({ id: lessons.id });
      await db.insert(lessonCohorts).values({ lessonId: exclusive.id, cohortId: cohort.id });
      exclusiveCount++;
    }

    // inscrições: alunos exclusivos desta turma (sem matrícula on-demand no curso)
    const nEnroll = Math.round(cohSeed.seats * cohSeed.enrollRatio);
    const cohortStudents = sample(studentIds, nEnroll);
    // fração de módulos já liberados no momento atual (para progresso coerente)
    const now = Date.now();
    const unlockedCount = cohSeed.moduleReleaseOffsets.filter((o) => daysFromNow(cohSeed.startOffsetDays + o).getTime() <= now).length;
    const unlockedRatio = rec.modules.length ? Math.max(1, unlockedCount) / rec.modules.length : 1;

    for (const studentId of cohortStudents) {
      await db.insert(cohortEnrollments).values({
        cohortId: cohort.id, studentId, enrolledAt: daysFromNow(cohSeed.startOffsetDays + randInt(0, 3)),
      }).onConflictDoNothing();
      // matrícula base + progresso (só nos módulos já liberados)
      await db.insert(enrollments).values({
        studentId, courseId: rec.id, status: 'active', enrolledAt: daysFromNow(cohSeed.startOffsetDays + 1),
      }).onConflictDoNothing();
      await completeProgress(studentId, rec, cohSeed.closed ? 1 : unlockedRatio);
      cohortEnrollCount++;
    }
  }
  log(`👥 ${COHORTS_SEED.length} turmas com cronograma, ${cohortEnrollCount} inscrições e ${exclusiveCount} aulas exclusivas.`);

  // ── Resumo ───────────────────────────────────────────────────────────────────
  log('\n✅ Seed concluído!');
  log('\n   Login de qualquer conta de seed:');
  log(`   • Admin:     admin@${SEED_DOMAIN}`);
  log(`   • Instrutor: instrutor1@${SEED_DOMAIN} … instrutor${INSTRUCTORS.length}@${SEED_DOMAIN}`);
  log(`   • Alunos:    ${STUDENT_COUNT} contas @${SEED_DOMAIN}`);
  log(`   • Senha:     ${SEED_PASSWORD}`);
  void admin;

  await pool.end();
}

seed().catch((err) => {
  console.error('❌ Seed falhou:', err);
  process.exit(1);
});
