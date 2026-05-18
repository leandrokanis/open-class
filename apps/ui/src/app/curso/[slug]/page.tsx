import Link from "next/link";
import { notFound } from "next/navigation";

const API_URL =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

interface Lesson {
  id: string;
  title: string;
  duration: number | null;
  order: number;
  contentType: string;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  level: string | null;
  thumbnailUrl: string | null;
  category: { id: string; name: string; slug: string } | null;
  instructor: { name: string };
  modules: Module[];
  createdAt: string;
}

async function fetchCourse(slug: string): Promise<CourseDetail | null> {
  const res = await fetch(`${API_URL}/api/catalog/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch course");
  const json = (await res.json()) as { data: CourseDetail };
  return json.data;
}

function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await fetchCourse(slug);

  if (!course) notFound();

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalSeconds = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + (l.duration ?? 0), 0),
    0,
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      {/* Header */}
      <div style={{
        background: "var(--gradient-hero)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <Link href="/" style={{
          color: "rgba(255,255,255,0.8)",
          textDecoration: "none",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          ← Catálogo
        </Link>
      </div>

      {/* Hero */}
      <div style={{
        background: "var(--gradient-hero-alt)",
        padding: "24px 20px 32px",
      }}>
        {course.category && (
          <span style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
            display: "block",
            marginBottom: "8px",
          }}>
            {course.category.name}
          </span>
        )}
        <h1 style={{
          fontSize: "22px",
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1.25,
          marginBottom: "8px",
        }}>
          {course.title}
        </h1>
        {course.shortDescription && (
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", marginBottom: "16px" }}>
            {course.shortDescription}
          </p>
        )}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
            por {course.instructor.name}
          </span>
          {course.level && (
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
              {LEVEL_LABELS[course.level] ?? course.level}
            </span>
          )}
          {totalLessons > 0 && (
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
              {totalLessons} aulas · {formatDuration(totalSeconds)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 20px", maxWidth: "720px", margin: "0 auto" }}>
        {course.description && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "var(--color-text-primary)" }}>
              Sobre o curso
            </h2>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              {course.description}
            </p>
          </div>
        )}

        {/* Modules */}
        {course.modules.length > 0 && (
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--color-text-primary)" }}>
              Conteúdo do curso
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {course.modules.map((mod) => (
                <div key={mod.id} style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-card)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    padding: "12px 16px",
                    background: "var(--color-surface-secondary)",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "var(--color-text-primary)",
                    borderBottom: "1px solid var(--color-border)",
                  }}>
                    {mod.title}
                    <span style={{ fontWeight: 400, color: "var(--color-text-secondary)", marginLeft: "8px" }}>
                      · {mod.lessons.length} aulas
                    </span>
                  </div>
                  <div>
                    {mod.lessons.map((lesson, idx) => (
                      <div key={lesson.id} style={{
                        padding: "10px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        borderBottom: idx < mod.lessons.length - 1 ? "1px solid var(--color-border)" : "none",
                      }}>
                        <span style={{ fontSize: "13px", color: "var(--color-text-tertiary)", width: "20px", flexShrink: 0 }}>
                          ▷
                        </span>
                        <span style={{ fontSize: "14px", color: "var(--color-text-primary)", flex: 1 }}>
                          {lesson.title}
                        </span>
                        {lesson.duration && (
                          <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)", flexShrink: 0 }}>
                            {formatDuration(lesson.duration)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: "32px", paddingBottom: "40px" }}>
          <button style={{
            width: "100%",
            padding: "16px",
            background: "var(--color-primary)",
            color: "#ffffff",
            border: "none",
            borderRadius: "var(--radius-btn)",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
          }}>
            Começar curso — GRÁTIS
          </button>
        </div>
      </div>
    </div>
  );
}
