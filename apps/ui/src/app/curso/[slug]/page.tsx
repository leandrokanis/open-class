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

const CATEGORY_GRADIENTS: Record<string, string> = {
  "desenvolvimento-web": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "design": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "dados": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "devops": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "mobile": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
};

function getCategoryGradient(slug?: string | null): string {
  return slug && CATEGORY_GRADIENTS[slug]
    ? CATEGORY_GRADIENTS[slug]
    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await fetchCourse(slug);

  if (!course) notFound();

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalSeconds = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + (l.duration ?? 0), 0),
    0,
  );

  const thumbnailGradient = getCategoryGradient(course.category?.slug);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      {/* Header — light */}
      <div style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <Link href="/" style={{
          color: "var(--color-text-primary)",
          textDecoration: "none",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontWeight: 500,
        }}>
          ← Catálogo
        </Link>
      </div>

      {/* Thumbnail block — gradient only here */}
      <div style={{
        background: thumbnailGradient,
        aspectRatio: "16/9",
        maxHeight: "240px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          background: "rgba(255,255,255,0.25)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}>
          <span style={{ fontSize: "24px", color: "#ffffff", marginLeft: "4px" }}>▶</span>
        </div>
        {totalSeconds > 0 && (
          <span style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            background: "rgba(0,0,0,0.55)",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: "4px",
          }}>
            {formatDuration(totalSeconds)}
          </span>
        )}
      </div>

      {/* Course info — light background */}
      <div style={{ padding: "20px 20px 0", maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
          {course.category && (
            <span style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              background: "var(--color-primary-light, #ede9fe)",
              padding: "3px 8px",
              borderRadius: "4px",
            }}>
              {course.category.name}
            </span>
          )}
          {course.level && (
            <span style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              background: "var(--color-surface-secondary)",
              padding: "3px 8px",
              borderRadius: "4px",
            }}>
              {LEVEL_LABELS[course.level] ?? course.level}
            </span>
          )}
        </div>

        <h1 style={{
          fontSize: "20px",
          fontWeight: 800,
          color: "var(--color-text-primary)",
          lineHeight: 1.3,
          marginBottom: "8px",
        }}>
          {course.title}
        </h1>

        {course.shortDescription && (
          <p style={{
            fontSize: "14px",
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            marginBottom: "12px",
          }}>
            {course.shortDescription}
          </p>
        )}

        <div style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          paddingBottom: "16px",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "24px",
        }}>
          <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
            por <strong style={{ color: "var(--color-text-primary)" }}>{course.instructor.name}</strong>
          </span>
          {totalLessons > 0 && (
            <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              {totalLessons} aulas
            </span>
          )}
        </div>

        {/* Description */}
        {course.description && (
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{
              fontSize: "15px",
              fontWeight: 700,
              marginBottom: "8px",
              color: "var(--color-text-primary)",
            }}>
              Sobre o curso
            </h2>
            <p style={{
              fontSize: "14px",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
            }}>
              {course.description}
            </p>
          </div>
        )}

        {/* Modules */}
        {course.modules.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{
              fontSize: "15px",
              fontWeight: 700,
              marginBottom: "14px",
              color: "var(--color-text-primary)",
            }}>
              Conteúdo do curso
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {course.modules.map((mod) => (
                <div key={mod.id} style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-card)",
                  overflow: "hidden",
                  background: "var(--color-surface)",
                }}>
                  <div style={{
                    padding: "12px 16px",
                    background: "var(--color-surface-secondary)",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "var(--color-text-primary)",
                    borderBottom: "1px solid var(--color-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span>{mod.title}</span>
                    <span style={{ fontWeight: 400, fontSize: "12px", color: "var(--color-text-secondary)" }}>
                      {mod.lessons.length} aulas
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
                        background: "var(--color-surface)",
                      }}>
                        <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)", width: "18px", flexShrink: 0 }}>
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
        <div style={{ paddingBottom: "48px" }}>
          <button style={{
            width: "100%",
            padding: "15px",
            background: "var(--color-primary)",
            color: "#ffffff",
            border: "none",
            borderRadius: "var(--radius-btn)",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.01em",
          }}>
            Começar curso — GRÁTIS
          </button>
        </div>
      </div>
    </div>
  );
}
