import styled from "styled-components";
import type { CourseDetail } from "@/lib/course-detail";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const Wrapper = styled.div`
  padding: 20px 20px 0;
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const CategoryBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary);
  background: var(--color-primary-light, #eff6ff);
  padding: 3px 8px;
  border-radius: var(--radius-badge);
`;

const LevelBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 3px 8px;
  border-radius: var(--radius-badge);
  background: var(--color-surface-secondary);
`;

const CourseTitle = styled.h1`
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text-primary);
  line-height: 1.3;
  margin-bottom: 10px;
  font-family: var(--font-inter), system-ui, sans-serif;

  @media (min-width: 768px) {
    font-size: 26px;
  }
`;

const ShortDesc = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 14px;
`;

const StatItem = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RatingValue = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
`;

const StarIcon = styled.span`
  color: var(--color-star, #f59e0b);
`;

const InstructorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gradient-avatar, var(--color-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
`;

const InstructorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const InstructorLabel = styled.span`
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const InstructorName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

interface CourseMetaProps {
  course: CourseDetail;
  totalLessons: number;
  showDescription?: boolean;
}

export function CourseMeta({ course, totalLessons, showDescription = false }: CourseMetaProps) {
  const initial = course.instructor.name.charAt(0).toUpperCase();

  return (
    <Wrapper>
      <BadgeRow>
        {course.category && (
          <CategoryBadge>{course.category.name}</CategoryBadge>
        )}
        {course.level && (
          <LevelBadge>{LEVEL_LABELS[course.level] ?? course.level}</LevelBadge>
        )}
      </BadgeRow>

      <CourseTitle>{course.title}</CourseTitle>

      {showDescription && course.shortDescription && (
        <ShortDesc>{course.shortDescription}</ShortDesc>
      )}

      <StatsRow>
        {course.rating != null && (
          <StatItem>
            <StarIcon>★</StarIcon>
            <RatingValue>{course.rating.toFixed(1)}</RatingValue>
            {course.reviewCount > 0 && (
              <span>({course.reviewCount.toLocaleString("pt-BR")} avaliações)</span>
            )}
          </StatItem>
        )}
        {totalLessons > 0 && (
          <StatItem>
            <span>🕐</span>
            {totalLessons} aulas
          </StatItem>
        )}
      </StatsRow>

      <InstructorRow>
        <Avatar>{initial}</Avatar>
        <InstructorInfo>
          <InstructorLabel>Instrutor</InstructorLabel>
          <InstructorName>{course.instructor.name}</InstructorName>
        </InstructorInfo>
      </InstructorRow>
    </Wrapper>
  );
}
