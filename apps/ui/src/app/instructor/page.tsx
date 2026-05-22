import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe } from "@/lib/dashboard";
import {
  fetchInstructorStats,
  fetchMyCourses,
} from "@/lib/instructor";
import { MetricCard } from "@/components/instructor/MetricCard";
import { CourseListTable } from "@/components/instructor/CourseListTable";
import { NewCourseButton } from "@/components/instructor/NewCourseButton";
import styled from "styled-components";

const Page = styled.div`
  min-height: 100vh;
  background: var(--color-background);
`;

const Header = styled.div`
  padding: 32px 40px 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
`;

const HeaderLeft = styled.div``;

const PageTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
`;

const Greeting = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const DateLabel = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const Content = styled.div`
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
`;

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString("pt-BR");
}

function formatRating(r: number | null): string {
  if (r === null) return "—";
  return r.toFixed(1);
}

function currentMonthLabel(): string {
  return new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export default async function InstructorOverviewPage() {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const [me, stats, coursesData] = await Promise.all([
    fetchMe(cookieHeader),
    fetchInstructorStats(cookieHeader),
    fetchMyCourses(cookieHeader, { limit: 50 }),
  ]);

  if (!me) redirect("/login");

  const monthLabel =
    currentMonthLabel().charAt(0).toUpperCase() + currentMonthLabel().slice(1);

  return (
    <Page>
      <Header>
        <HeaderLeft>
          <PageTitle>Meus Cursos</PageTitle>
          <Greeting>Bem-vindo(a) de volta, {me.name.split(" ")[0]}</Greeting>
        </HeaderLeft>
        <HeaderRight>
          <DateLabel>{monthLabel}</DateLabel>
          <NewCourseButton />
        </HeaderRight>
      </Header>

      <Content>
        <MetricsGrid>
          <MetricCard
            icon="group"
            label="Total de Alunos"
            value={formatNumber(stats.totalStudents)}
          />
          <MetricCard
            icon="school"
            label="Cursos Publicados"
            value={String(stats.publishedCount)}
          />
          <MetricCard
            icon="star"
            label="Avaliação Média"
            value={formatRating(stats.avgRating)}
          />
          <MetricCard
            icon="trending_up"
            label="Novas Matrículas / Mês"
            value={formatNumber(stats.newEnrollmentsThisMonth)}
          />
        </MetricsGrid>

        <CourseListTable initialCourses={coursesData.rows} />
      </Content>
    </Page>
  );
}
