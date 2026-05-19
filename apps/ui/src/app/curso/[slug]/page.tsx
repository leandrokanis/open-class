import { notFound } from "next/navigation";
import styled from "styled-components";
import { fetchCourseDetail } from "@/lib/course-detail";
import { AppHeader } from "@/components/catalog/AppHeader";
import { MobileBottomNav } from "@/components/catalog/MobileBottomNav";
import { CourseDetailHeader } from "@/components/course-detail/CourseDetailHeader";
import { CourseHero } from "@/components/course-detail/CourseHero";
import { CourseMeta } from "@/components/course-detail/CourseMeta";
import { CourseContent } from "@/components/course-detail/CourseContent";
import { CourseProgressSection } from "@/components/course-detail/CourseProgressSection";
import { CourseDetailSidebar } from "@/components/course-detail/CourseDetailSidebar";

const MobileLayout = styled.div`
  min-height: 100vh;
  background: var(--color-background);

  @media (min-width: 768px) {
    display: none;
  }
`;

const DesktopLayout = styled.div`
  display: none;
  min-height: 100vh;
  background: var(--color-background);

  @media (min-width: 768px) {
    display: block;
  }
`;

const DesktopHero = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 60%, #1e40af 100%);
  padding: 40px 48px 40px;
`;

const HeroInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
  align-items: start;
`;

const HeroLeft = styled.div`
  color: var(--color-text-on-dark, #ffffff);
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

const PreviewCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-card);
  backdrop-filter: blur(8px);
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
`;

const PlayBtn = styled.div`
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 22px;
    height: 22px;
    fill: #ffffff;
    margin-left: 3px;
  }
`;

const PreviewLabel = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const DesktopMain = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 48px;
  display: flex;
  gap: 48px;
  align-items: flex-start;
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const AboutSection = styled.section`
  margin-bottom: 32px;
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
  const course = await fetchCourseDetail(slug);

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
          totalDurationMinutes={totalDurationMinutes}
        />

        <CourseMeta course={course} totalLessons={totalLessons} />

        {course.description && (
          <AboutSection style={{ padding: "20px 20px 0" }}>
            <SectionHeading style={{ fontSize: "15px" }}>Sobre este curso</SectionHeading>
            <AboutText style={{ fontSize: "14px" }}>{course.description}</AboutText>
          </AboutSection>
        )}

        <CourseProgressSection courseId={course.id} modules={course.modules} />

        <CourseContent modules={course.modules} completedLessonIds={[]} />

        <MobileBottomPad />
        <MobileBottomNav />
      </MobileLayout>

      {/* ─── DESKTOP LAYOUT ─── */}
      <DesktopLayout>
        <AppHeader />

        <DesktopHero>
          <HeroInner>
            <HeroLeft>
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
            </HeroLeft>

            <PreviewCard>
              <PlayBtn aria-label="Assistir prévia gratuita">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </PlayBtn>
              <PreviewLabel>Assistir prévia gratuita</PreviewLabel>
            </PreviewCard>
          </HeroInner>
        </DesktopHero>

        <DesktopMain>
          <MainContent>
            {course.description && (
              <AboutSection>
                <SectionHeading>Sobre este curso</SectionHeading>
                <AboutText>{course.description}</AboutText>
              </AboutSection>
            )}

            <CourseContent modules={course.modules} completedLessonIds={[]} />
          </MainContent>

          <CourseDetailSidebar
            course={course}
            modules={course.modules}
            totalLessons={totalLessons}
            totalDurationMinutes={totalDurationMinutes}
          />
        </DesktopMain>
      </DesktopLayout>
    </>
  );
}
