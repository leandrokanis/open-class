import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import styled from "styled-components";
import { fetchCourseDetail } from "@/lib/course-detail";
import { AppHeader } from "@/components/catalog/AppHeader";
import { CourseDetailHeader } from "@/components/course-detail/CourseDetailHeader";
import { CourseHero } from "@/components/course-detail/CourseHero";
import { CourseMeta } from "@/components/course-detail/CourseMeta";
import { CourseContent } from "@/components/course-detail/CourseContent";
import { CourseProgressSection } from "@/components/course-detail/CourseProgressSection";
import { CourseDetailSidebar } from "@/components/course-detail/CourseDetailSidebar";

/* ─── Mobile ─────────────────────────────────────────────────────────────── */

const MobileLayout = styled.div`
  min-height: 100vh;
  background: var(--color-background);

  @media (min-width: 768px) {
    display: none;
  }
`;

/* ─── Desktop ─────────────────────────────────────────────────────────────── */

const DesktopLayout = styled.div`
  display: none;
  min-height: 100vh;
  background: var(--color-background);

  @media (min-width: 768px) {
    display: block;
  }
`;

/* Hero background is absolute so the sidebar can visually overlap it */
const DesktopWrapper = styled.div`
  position: relative;
`;

const HeroBackground = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 60%, #1e40af 100%);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 420px;
  z-index: 0;
`;

const DesktopGrid = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 48px 60px;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
  align-items: start;
`;

const LeftColumn = styled.div`
  min-width: 0;
`;

const HeroText = styled.div`
  padding-bottom: 40px;
  color: #ffffff;
`;

const HeroTitle = styled.h1`
  font-size: 32px;
  font-weight: 900;
  line-height: 1.2;
  color: #ffffff;
  margin: 16px 0 14px;
  font-family: var(--font-inter), system-ui, sans-serif;
`;

const HeroDesc = styled.p`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 16px;
  max-width: 560px;
`;

const HeroStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
`;

const HeroRating = styled.span`
  font-weight: 700;
  color: #fbbf24;
`;

const HeroInstructor = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
`;

const HeroAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
`;

const MainContent = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
`;

const AboutSection = styled.section`
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
`;

const SectionHeading = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  font-family: var(--font-inter), system-ui, sans-serif;
`;

const AboutText = styled.p`
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.7;
`;

const MobileBottomPad = styled.div`
  height: 80px;
`;

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const cookie = cookieStore.toString();
  const course = await fetchCourseDetail(slug, cookie || undefined);

  if (!course) notFound();

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDurationMinutes = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + Math.round((l.duration ?? 0) / 60), 0),
    0,
  );

  const instructorInitial = course.instructor.name.charAt(0).toUpperCase();

  return (
    <>
      {/* ─── MOBILE LAYOUT ─── */}
      <MobileLayout>
        <CourseDetailHeader />

        <CourseHero
          categorySlug={course.category?.slug}
          thumbnailUrl={course.thumbnailUrl}
        />

        <CourseMeta course={course} totalLessons={totalLessons} totalDurationMinutes={totalDurationMinutes} />

        {course.description && (
          <AboutSection style={{ padding: "20px 20px 0", border: "none" }}>
            <SectionHeading style={{ fontSize: "15px" }}>Sobre este curso</SectionHeading>
            <AboutText style={{ fontSize: "14px" }}>{course.description}</AboutText>
          </AboutSection>
        )}

        <CourseProgressSection course={course} modules={course.modules} />

        <CourseContent modules={course.modules} completedLessonIds={[]} />

        <MobileBottomPad />
      </MobileLayout>

      {/* ─── DESKTOP LAYOUT ─── */}
      <DesktopLayout>
        <AppHeader />

        <DesktopWrapper>
          <HeroBackground />

          <DesktopGrid>
            {/* Left column: hero text + main content */}
            <LeftColumn>
              <HeroText>
                <CourseDetailHeader
                  variant="desktop"
                  categoryName={course.category?.name}
                  categorySlug={course.category?.slug}
                  courseTitle={course.title}
                />

                <HeroTitle>{course.title}</HeroTitle>

                {course.shortDescription && (
                  <HeroDesc>{course.shortDescription}</HeroDesc>
                )}

                <HeroStats>
                  {course.rating != null && (
                    <span>
                      <HeroRating>★ {course.rating.toFixed(1)}</HeroRating>
                      {course.reviewCount > 0 && (
                        <span style={{ color: "rgba(255,255,255,0.7)" }}>
                          {" "}({course.reviewCount.toLocaleString("pt-BR")} avaliações)
                        </span>
                      )}
                    </span>
                  )}
                  {totalLessons > 0 && <span>{totalLessons} aulas</span>}
                  {totalDurationMinutes > 0 && (
                    <span>
                      {totalDurationMinutes >= 60
                        ? `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60 > 0 ? `${totalDurationMinutes % 60}min` : ""}`
                        : `${totalDurationMinutes}min`}
                    </span>
                  )}
                  {course.level && (
                    <span>{LEVEL_LABELS[course.level] ?? course.level}</span>
                  )}
                </HeroStats>

                <HeroInstructor>
                  <HeroAvatar>{instructorInitial}</HeroAvatar>
                  <span>por {course.instructor.name}</span>
                </HeroInstructor>
              </HeroText>

              <MainContent>
                {course.description && (
                  <AboutSection>
                    <SectionHeading>Sobre este curso</SectionHeading>
                    <AboutText>{course.description}</AboutText>
                  </AboutSection>
                )}

                <CourseContent modules={course.modules} completedLessonIds={[]} />
              </MainContent>
            </LeftColumn>

            {/* Right column: sidebar with thumbnail at top */}
            <CourseDetailSidebar
              course={course}
              modules={course.modules}
              totalLessons={totalLessons}
              totalDurationMinutes={totalDurationMinutes}
            />
          </DesktopGrid>
        </DesktopWrapper>
      </DesktopLayout>
    </>
  );
}
