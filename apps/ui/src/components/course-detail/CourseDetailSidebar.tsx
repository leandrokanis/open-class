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
    gap: 0;
    position: sticky;
    top: 80px;
    width: 340px;
    flex-shrink: 0;
    border-radius: var(--radius-card);
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    border: 1px solid var(--color-border);
  }
`;

const Card = styled.div`
  background: var(--color-surface);
`;

const ThumbnailWrapper = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #1e293b;
  position: relative;
  overflow: hidden;
`;

const ThumbnailImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ThumbnailPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
`;

const Divider = styled.div`
  height: 1px;
  background: var(--color-border);
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
  overflow: hidden;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  align-items: center;
  gap: 10px 16px;
  margin: 0;
  padding: 16px 16px 16px;
`;

const MetaTerm = styled.dt`
  font-size: 13px;
  color: var(--color-text-secondary);
  align-self: center;
`;

const MetaValue = styled.dd`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  text-align: right;
  align-self: center;
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
      {/* Thumbnail */}
      <ThumbnailWrapper>
        {course.thumbnailUrl ? (
          <ThumbnailImg src={course.thumbnailUrl} alt={course.title} />
        ) : (
          <ThumbnailPlaceholder />
        )}
      </ThumbnailWrapper>

      <Divider />

      {/* Progress / enroll */}
      <Card>
        <CourseProgressSection
          course={course}
          modules={modules}
          onCompletedLessonsLoaded={onCompletedLessonsLoaded}
        />
      </Card>

      <Divider />

      {/* Instructor */}
      <InstructorCard>
        <InstructorTop>
          <Avatar>
            {course.instructor.avatarUrl
              ? <AvatarImg src={course.instructor.avatarUrl} alt={course.instructor.name} />
              : initial}
          </Avatar>
          <div>
            <InstructorLabel>Instrutor</InstructorLabel>
            <InstructorName>{course.instructor.name}</InstructorName>
          </div>
        </InstructorTop>
      </InstructorCard>

      <Divider />

      {/* Meta */}
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
