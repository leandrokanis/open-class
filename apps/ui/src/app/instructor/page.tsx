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
  background: #f8fafc;
`;

const Header = styled.div`
  padding: 32px 40px 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
`;

const HeaderLeft = styled.div``;

const PageTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
`;

const Greeting = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const DateLabel = styled.span`
  font-size: 13px;
  color: #64748b;
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
          <PageTitle>Visão Geral</PageTitle>
          <Greeting>Bem-vindo(a) de volta, {me.name.split(" ")[0]} 👋</Greeting>
        </HeaderLeft>
        <HeaderRight>
          <DateLabel>{monthLabel}</DateLabel>
          <NewCourseButton />
        </HeaderRight>
      </Header>

      <Content>
        <MetricsGrid>
          <MetricCard
            icon="👥"
            iconBg="#eff6ff"
            label="Total de Alunos"
            value={formatNumber(stats.totalStudents)}
          />
          <MetricCard
            icon="📚"
            iconBg="#f0fdf4"
            label="Cursos Publicados"
            value={String(stats.publishedCount)}
          />
          <MetricCard
            icon="⭐"
            iconBg="#fffbeb"
            label="Avaliação Média"
            value={formatRating(stats.avgRating)}
          />
          <MetricCard
            icon="👁"
            iconBg="#f0fdf4"
            label="Novas Matrículas / Mês"
            value={formatNumber(stats.newEnrollmentsThisMonth)}
          />
        </MetricsGrid>

        <CourseListTable initialCourses={coursesData.rows} />
      </Content>
    </Page>
  );
}
