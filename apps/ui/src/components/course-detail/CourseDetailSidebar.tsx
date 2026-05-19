"use client";

import styled from "styled-components";
import Link from "next/link";
import type { CourseDetail, CourseModule } from "@/lib/course-detail";
import { CourseProgressSection } from "./CourseProgressSection";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const Sidebar = styled.aside`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 80px;
    width: 320px;
    flex-shrink: 0;
  }
`;

const Card = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
`;

const InstructorCard = styled(Card)`
  padding: 16px;
`;

const InstructorTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient-avatar, var(--color-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
`;

const InstructorLabel = styled.span`
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: block;
`;

const InstructorName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const MetaList = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 16px;
  margin: 0;
  padding: 0 16px 16px;
`;

const MetaTerm = styled.dt`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const MetaValue = styled.dd`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  text-align: right;
`;

const MetaLink = styled(Link)`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

interface CourseDetailSidebarProps {
  course: CourseDetail;
  modules: CourseModule[];
  totalLessons: number;
  totalDurationMinutes: number;
  onCompletedLessonsLoaded?: (ids: string[]) => void;
}

export function CourseDetailSidebar({
  course,
  modules,
  totalLessons,
  totalDurationMinutes,
  onCompletedLessonsLoaded,
}: CourseDetailSidebarProps) {
  const initial = course.instructor.name.charAt(0).toUpperCase();

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
  }

  return (
    <Sidebar>
      <Card>
        <CourseProgressSection
          courseId={course.id}
          modules={modules}
          onCompletedLessonsLoaded={onCompletedLessonsLoaded}
        />
      </Card>

      <InstructorCard>
        <InstructorTop>
          <Avatar>{initial}</Avatar>
          <div>
            <InstructorLabel>Instrutor</InstructorLabel>
            <InstructorName>{course.instructor.name}</InstructorName>
          </div>
        </InstructorTop>
      </InstructorCard>

      <Card>
        <MetaList>
          <MetaTerm>Nível</MetaTerm>
          <MetaValue>{course.level ? (LEVEL_LABELS[course.level] ?? course.level) : "—"}</MetaValue>

          <MetaTerm>Total de aulas</MetaTerm>
          <MetaValue>{totalLessons} aulas</MetaValue>

          <MetaTerm>Duração total</MetaTerm>
          <MetaValue>{totalDurationMinutes > 0 ? formatDuration(totalDurationMinutes) : "—"}</MetaValue>

          {course.category && (
            <>
              <MetaTerm>Categoria</MetaTerm>
              <MetaValue>
                <MetaLink href={`/?category=${course.category.slug}`}>
                  {course.category.name}
                </MetaLink>
              </MetaValue>
            </>
          )}
        </MetaList>
      </Card>
    </Sidebar>
  );
}
