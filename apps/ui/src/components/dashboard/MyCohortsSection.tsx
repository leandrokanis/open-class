"use client";

import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/components/ui/Icon";
import type { MyCohort } from "@/lib/dashboard";

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
`;

const Card = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const CohortName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const CourseLink = styled(Link)`
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;

  &:hover { text-decoration: underline; }
`;

const StatusBadge = styled.span<{ $closed: boolean }>`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
  color: ${({ $closed }) => ($closed ? "var(--color-text-secondary)" : "var(--color-success)")};
  background: ${({ $closed }) => ($closed ? "var(--color-surface-secondary)" : "rgba(34,197,94,0.12)")};
  border: 1px solid var(--color-border);
`;

const Schedule = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ScheduleItem = styled.li<{ $released: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${({ $released }) => ($released ? "var(--color-text-primary)" : "var(--color-text-secondary)")};
`;

const ScheduleDate = styled.span`
  margin-left: auto;
  font-size: 12px;
  color: var(--color-text-tertiary);
`;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface MyCohortsSectionProps {
  cohorts: MyCohort[];
}

export function MyCohortsSection({ cohorts }: MyCohortsSectionProps) {
  if (cohorts.length === 0) return null;

  const now = new Date();

  return (
    <Section>
      <SectionTitle>Minhas turmas</SectionTitle>
      {cohorts.map((cohort) => {
        const closed = cohort.status === "encerrada";
        return (
          <Card key={cohort.id}>
            <Header>
              <Icon name="groups" size={18} style={{ color: "var(--color-primary)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <CohortName>{cohort.name}</CohortName>
                <CourseLink href={`/course/${cohort.course.slug}`}>{cohort.course.title}</CourseLink>
              </div>
              <StatusBadge $closed={closed}>{closed ? "Encerrada" : "Em andamento"}</StatusBadge>
            </Header>

            {cohort.schedule.length > 0 && (
              <Schedule>
                {cohort.schedule.map((item) => {
                  const released = new Date(item.availableFrom) <= now;
                  return (
                    <ScheduleItem key={item.moduleId} $released={released}>
                      <Icon name={released ? "lock_open" : "lock"} size={13} />
                      {item.moduleTitle}
                      <ScheduleDate>
                        {released ? "disponível" : `libera em ${formatDate(item.availableFrom)}`}
                      </ScheduleDate>
                    </ScheduleItem>
                  );
                })}
              </Schedule>
            )}
          </Card>
        );
      })}
    </Section>
  );
}
