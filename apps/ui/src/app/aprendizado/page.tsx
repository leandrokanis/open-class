import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe, fetchMyEnrollments, fetchRecentActivity } from "@/lib/dashboard";
import { AppHeader } from "@/components/catalog/AppHeader";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { EnrolledCourseCard } from "@/components/dashboard/EnrolledCourseCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { EmptyEnrollments } from "@/components/dashboard/EmptyEnrollments";
import styled from "styled-components";

const Page = styled.div`
  min-height: 100vh;
  background: var(--color-background);
`;

const Layout = styled.main`
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 48px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 32px;

  @media (max-width: 1023px) {
    grid-template-columns: minmax(0, 1fr);
    padding: 24px 20px;
  }
`;

const Section = styled.section`
  min-width: 0;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
`;

const SeeAllLink = styled.a`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const CourseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export default async function AprendizadoPage() {
  const cookieHeader = (await headers()).get("cookie") ?? "";

  const [me, enrollments, recentActivity] = await Promise.all([
    fetchMe(cookieHeader),
    fetchMyEnrollments(cookieHeader),
    fetchRecentActivity(cookieHeader, 5),
  ]);

  if (!me) redirect("/login");

  const inProgress = enrollments.filter((e) => e.status === "active");
  const completed = enrollments.filter((e) => e.status === "completed");
  const hoursWatched = Math.round(
    recentActivity.reduce((acc, _) => acc + 0, 0),
  );

  const totalHours = enrollments.reduce(
    (sum, e) => sum + Math.round((e.progress.completedLessons / Math.max(e.progress.totalLessons, 1)) * (e.course.totalDurationMinutes / 60)),
    0,
  );

  return (
    <Page>
      <AppHeader />
      <DashboardHero
        name={me.name}
        inProgress={inProgress.length}
        completed={completed.length}
        hoursWatched={totalHours}
      />
      <Layout>
        <Section>
          <SectionHeader>
            <SectionTitle>Em andamento</SectionTitle>
            {inProgress.length > 0 && (
              <SeeAllLink href="#">Ver todos</SeeAllLink>
            )}
          </SectionHeader>

          {inProgress.length === 0 ? (
            <EmptyEnrollments />
          ) : (
            <CourseList>
              {inProgress.map((enrollment, idx) => (
                <EnrolledCourseCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  featured={idx === 0}
                />
              ))}
            </CourseList>
          )}
        </Section>

        <RecentActivity items={recentActivity} />
      </Layout>
    </Page>
  );
}
