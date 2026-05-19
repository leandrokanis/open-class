import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from './index';
const { categories, courses, modules, lessons, users } = schema;
import { createHash, randomBytes } from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://openclass:openclass@localhost:5432/openclass';

function hashPassword(plain: string): string {
  // bcrypt-compatible placeholder using sha256 — good enough for seed/dev
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(plain + salt).digest('hex');
  return `$seed$${salt}$${hash}`;
}

const CATEGORIES = [
  { name: 'Dev Web', slug: 'dev-web', description: 'Desenvolvimento web front-end e back-end', position: 0 },
  { name: 'Design', slug: 'design', description: 'UI/UX, prototipação e design thinking', position: 1 },
  { name: 'Dados', slug: 'dados', description: 'Ciência de dados, ML e análise', position: 2 },
  { name: 'DevOps', slug: 'devops', description: 'Infraestrutura, CI/CD e cloud', position: 3 },
  { name: 'Mobile', slug: 'mobile', description: 'Desenvolvimento iOS e Android', position: 4 },
];

const INSTRUCTORS = [
  { name: 'Carlos Mendes', email: 'carlos@openclass.dev' },
  { name: 'Marina Costa', email: 'marina@openclass.dev' },
  { name: 'Ana Lima', email: 'ana@openclass.dev' },
  { name: 'Rodrigo Neves', email: 'rodrigo@openclass.dev' },
  { name: 'Pedro Alves', email: 'pedro@openclass.dev' },
  { name: 'Juliana Ferr.', email: 'juliana@openclass.dev' },
];

const COURSES_SEED = [
  {
    instructorIdx: 0, categorySlug: 'dev-web',
    title: 'JavaScript do Zero ao Avançado: Guia Completo 2025',
    slug: 'javascript-zero-avancado-2025',
    shortDescription: 'Domine JavaScript do básico ao avançado com projetos reais.',
    level: 'intermediate' as const, rating: '4.8', reviewCount: 1200,
    modules: [
      { title: 'Fundamentos', lessons: [
        { title: 'Variáveis e Tipos', duration: 720 },
        { title: 'Funções e Escopo', duration: 960 },
        { title: 'Arrays e Objetos', duration: 1080 },
      ]},
      { title: 'JavaScript Moderno', lessons: [
        { title: 'ES6+ Features', duration: 840 },
        { title: 'Promises e Async/Await', duration: 1200 },
        { title: 'Módulos', duration: 600 },
      ]},
    ],
  },
  {
    instructorIdx: 1, categorySlug: 'dev-web',
    title: 'React na Prática: Hooks, Context e React Query',
    slug: 'react-pratica-hooks-context-query',
    shortDescription: 'Construa aplicações React modernas com as melhores práticas.',
    level: 'advanced' as const, rating: '4.9', reviewCount: 874,
    modules: [
      { title: 'React Fundamentals', lessons: [
        { title: 'JSX e Componentes', duration: 660 },
        { title: 'useState e useEffect', duration: 900 },
        { title: 'Props e composição', duration: 780 },
      ]},
      { title: 'Estado e Dados', lessons: [
        { title: 'useContext', duration: 720 },
        { title: 'React Query na prática', duration: 1440 },
      ]},
    ],
  },
  {
    instructorIdx: 2, categorySlug: 'design',
    title: 'UI/UX Design: Do Conceito ao Protótipo',
    slug: 'uiux-design-conceito-prototipo',
    shortDescription: 'Aprenda design de interfaces do zero com ferramentas profissionais.',
    level: 'beginner' as const, rating: '4.7', reviewCount: 531,
    modules: [
      { title: 'Fundamentos de Design', lessons: [
        { title: 'Princípios visuais', duration: 840 },
        { title: 'Tipografia e cor', duration: 720 },
        { title: 'Layout e grid', duration: 960 },
      ]},
      { title: 'Prototipação', lessons: [
        { title: 'Wireframes', duration: 600 },
        { title: 'Protótipo interativo', duration: 1080 },
      ]},
    ],
  },
  {
    instructorIdx: 3, categorySlug: 'dados',
    title: 'Python para Análise de Dados com Pandas',
    slug: 'python-analise-dados-pandas',
    shortDescription: 'Domine Python e Pandas para análise e visualização de dados.',
    level: 'intermediate' as const, rating: '4.6', reviewCount: 318,
    modules: [
      { title: 'Python Essencial', lessons: [
        { title: 'Sintaxe básica', duration: 720 },
        { title: 'Listas e dicionários', duration: 840 },
        { title: 'Funções e lambdas', duration: 660 },
      ]},
      { title: 'Pandas na Prática', lessons: [
        { title: 'DataFrames', duration: 960 },
        { title: 'Limpeza de dados', duration: 1080 },
        { title: 'Visualização com matplotlib', duration: 900 },
      ]},
    ],
  },
  {
    instructorIdx: 4, categorySlug: 'devops',
    title: 'Docker & DevOps para Desenvolvedores',
    slug: 'docker-devops-desenvolvedores',
    shortDescription: 'Aprenda Docker, CI/CD e deploy em produção do zero.',
    level: 'intermediate' as const, rating: '4.5', reviewCount: 412,
    modules: [
      { title: 'Docker', lessons: [
        { title: 'Containers e imagens', duration: 900 },
        { title: 'Docker Compose', duration: 1080 },
        { title: 'Redes e volumes', duration: 720 },
      ]},
      { title: 'CI/CD', lessons: [
        { title: 'GitHub Actions', duration: 960 },
        { title: 'Deploy automatizado', duration: 840 },
      ]},
    ],
  },
  {
    instructorIdx: 5, categorySlug: 'mobile',
    title: 'Flutter Mobile: Apps Nativos do Zero',
    slug: 'flutter-mobile-apps-nativos',
    shortDescription: 'Crie aplicativos iOS e Android com Flutter e Dart.',
    level: 'beginner' as const, rating: '4.7', reviewCount: 328,
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
    instructorIdx: 0, categorySlug: 'dev-web',
    title: 'NestJS do Zero ao Avançado com TypeScript',
    slug: 'nestjs-zero-avancado-typescript',
    shortDescription: 'Construa APIs robustas com NestJS, Drizzle e PostgreSQL.',
    level: 'advanced' as const, rating: '4.9', reviewCount: 265,
    modules: [
      { title: 'NestJS Core', lessons: [
        { title: 'Módulos e DI', duration: 900 },
        { title: 'Controllers e Services', duration: 840 },
        { title: 'Pipes e Guards', duration: 720 },
      ]},
      { title: 'Banco e Auth', lessons: [
        { title: 'Drizzle ORM', duration: 1080 },
        { title: 'JWT e autenticação', duration: 960 },
      ]},
    ],
  },
  {
    instructorIdx: 2, categorySlug: 'design',
    title: 'Design System: Do Zero à Biblioteca de Componentes',
    slug: 'design-system-zero-biblioteca',
    shortDescription: 'Crie um Design System completo com tokens, componentes e documentação.',
    level: 'intermediate' as const, rating: '4.6', reviewCount: 189,
    modules: [
      { title: 'Fundamentos de Design System', lessons: [
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
    instructorIdx: 3, categorySlug: 'dados',
    title: 'Machine Learning com Scikit-Learn',
    slug: 'machine-learning-scikit-learn',
    shortDescription: 'Aprenda os principais algoritmos de ML com Python.',
    level: 'advanced' as const, rating: '4.8', reviewCount: 445,
    modules: [
      { title: 'Conceitos de ML', lessons: [
        { title: 'Tipos de aprendizado', duration: 720 },
        { title: 'Pré-processamento', duration: 900 },
      ]},
      { title: 'Algoritmos', lessons: [
        { title: 'Regressão linear', duration: 960 },
        { title: 'Classificação', duration: 1080 },
        { title: 'Clustering', duration: 840 },
      ]},
    ],
  },
  {
    instructorIdx: 4, categorySlug: 'devops',
    title: 'Kubernetes na Prática: Deploy em Produção',
    slug: 'kubernetes-pratica-deploy-producao',
    shortDescription: 'Orquestre containers com Kubernetes e deploy em cloud.',
    level: 'advanced' as const, rating: '4.7', reviewCount: 223,
    modules: [
      { title: 'Kubernetes Fundamentos', lessons: [
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
    instructorIdx: 5, categorySlug: 'mobile',
    title: 'React Native: Apps Cross-Platform Profissionais',
    slug: 'react-native-apps-cross-platform',
    shortDescription: 'Desenvolva apps iOS e Android com React Native e Expo.',
    level: 'intermediate' as const, rating: '4.5', reviewCount: 367,
    modules: [
      { title: 'React Native Basics', lessons: [
        { title: 'Setup com Expo', duration: 600 },
        { title: 'Componentes nativos', duration: 780 },
        { title: 'Navegação com Expo Router', duration: 960 },
      ]},
      { title: 'Features Avançadas', lessons: [
        { title: 'Câmera e arquivos', duration: 840 },
        { title: 'Push notifications', duration: 720 },
      ]},
    ],
  },
  {
    instructorIdx: 1, categorySlug: 'dev-web',
    title: 'CSS Moderno: Grid, Flexbox e Animações',
    slug: 'css-moderno-grid-flexbox-animacoes',
    shortDescription: 'Domine CSS moderno com layouts responsivos e animações.',
    level: 'beginner' as const, rating: '4.4', reviewCount: 612,
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

async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('🌱 Seeding database...');

  // Upsert categories
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, cat.slug));

    if (existing.length > 0) {
      categoryMap.set(cat.slug, existing[0].id);
      console.log(`  ✓ Category "${cat.name}" already exists`);
    } else {
      const [inserted] = await db.insert(categories).values(cat).returning({ id: categories.id });
      categoryMap.set(cat.slug, inserted.id);
      console.log(`  + Category "${cat.name}" created`);
    }
  }

  // Upsert instructors
  const instructorIds: string[] = [];
  for (const inst of INSTRUCTORS) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, inst.email));

    if (existing.length > 0) {
      instructorIds.push(existing[0].id);
      console.log(`  ✓ Instructor "${inst.name}" already exists`);
    } else {
      const [inserted] = await db.insert(users).values({
        name: inst.name,
        email: inst.email,
        passwordHash: hashPassword('senha123'),
        role: 'instrutor',
      }).returning({ id: users.id });
      instructorIds.push(inserted.id);
      console.log(`  + Instructor "${inst.name}" created`);
    }
  }

  // Upsert courses with modules and lessons
  for (const courseSeed of COURSES_SEED) {
    const categoryId = categoryMap.get(courseSeed.categorySlug)!;
    const instructorId = instructorIds[courseSeed.instructorIdx];

    const existing = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.slug, courseSeed.slug));

    let courseId: string;
    if (existing.length > 0) {
      courseId = existing[0].id;
      console.log(`  ✓ Course "${courseSeed.title}" already exists`);
    } else {
      const [inserted] = await db.insert(courses).values({
        instructorId,
        categoryId,
        title: courseSeed.title,
        slug: courseSeed.slug,
        shortDescription: courseSeed.shortDescription,
        level: courseSeed.level,
        status: 'published',
        rating: courseSeed.rating,
        reviewCount: courseSeed.reviewCount,
      }).returning({ id: courses.id });
      courseId = inserted.id;
      console.log(`  + Course "${courseSeed.title}" created`);
    }

    // Create modules and lessons
    let modulePosition = 1;
    for (const mod of courseSeed.modules) {
      const existingMod = await db
        .select({ id: modules.id })
        .from(modules)
        .where(eq(modules.courseId, courseId));

      if (existingMod.length > 0) {
        break; // modules already exist for this course
      }

      const [insertedMod] = await db.insert(modules).values({
        courseId,
        title: mod.title,
        position: modulePosition++,
        visibility: 'visible',
      }).returning({ id: modules.id });

      let lessonPosition = 1;
      for (const lesson of mod.lessons) {
        await db.insert(lessons).values({
          moduleId: insertedMod.id,
          title: lesson.title,
          youtubeUrl: '',
          contentType: 'video',
          duration: lesson.duration,
          position: lessonPosition++,
          visibility: 'visible',
        });
      }
    }
  }

  console.log('\n✅ Seed complete!');
  await pool.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
