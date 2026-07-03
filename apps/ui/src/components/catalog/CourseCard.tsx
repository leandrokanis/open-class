import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import type { CourseListItem } from "@/lib/catalog";

const CATEGORY_GRADIENTS: Record<string, string> = {
  "dev-web": "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
  design: "linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)",
  dados: "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
  devops: "linear-gradient(135deg, #0f4c75 0%, #1a7abf 100%)",
  mobile: "linear-gradient(135deg, #155e75 0%, #06b6d4 100%)",
};

const DEFAULT_GRADIENT = "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#065f46",
  intermediate: "#1e40af",
  advanced: "#7c2d12",
};

const Card = styled(Link)`
  text-decoration: none;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-card);
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const Thumbnail = styled.div<{ $gradient: string }>`
  position: relative;
  aspect-ratio: 16 / 9;
  background: ${({ $gradient }) => $gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ThumbImg = styled(Image)`
  object-fit: cover;
`;

const CategoryBadge = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.45);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
`;

const DurationBadge = styled.span`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.55);
  color: #ffffff;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
`;

const Content = styled.div`
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (min-width: 768px) {
    font-size: 15px;
  }
`;

const Instructor = styled.p`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
`;

const Rating = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const ReviewCount = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-secondary);
`;

const LessonCount = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const Badges = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
`;

const GratisBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-primary);
  border: 1.5px solid var(--color-primary);
  padding: 2px 8px;
  border-radius: 4px;
`;

const LevelBadge = styled.span<{ $color: string }>`
  font-size: 11px;
  font-weight: 500;
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $color }) => $color}44;
  background: ${({ $color }) => $color}11;
  padding: 2px 8px;
  border-radius: 4px;
`;

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatReviews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface CourseCardProps {
  course: CourseListItem;
}

export function CourseCard({ course }: CourseCardProps) {
  const gradient = CATEGORY_GRADIENTS[course.category?.slug ?? ""] ?? DEFAULT_GRADIENT;
  const levelColor = LEVEL_COLORS[course.level ?? ""] ?? "#6b7280";

  return (
    <Card href={`/course/${course.slug}`}>
      <Thumbnail $gradient={gradient}>
        {course.thumbnailUrl && (
          <ThumbImg src={course.thumbnailUrl} alt={course.title} fill unoptimized />
        )}
        {course.category && (
          <CategoryBadge>{course.category.name}</CategoryBadge>
        )}
        {course.totalDurationMinutes > 0 && (
          <DurationBadge>{formatDuration(course.totalDurationMinutes)}</DurationBadge>
        )}
      </Thumbnail>
      <Content>
        <Title>{course.title}</Title>
        <Instructor>por {course.instructor.name}</Instructor>
        <Meta>
          {course.rating !== null && (
            <Rating>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="#f59e0b">
                <path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9 3 10.5l.5-3.5L1 4.5 4.5 4z" />
              </svg>
              {course.rating.toFixed(1)}
              <ReviewCount>({formatReviews(course.reviewCount)})</ReviewCount>
            </Rating>
          )}
          {course.lessonCount > 0 && (
            <LessonCount>{course.lessonCount} aulas</LessonCount>
          )}
        </Meta>
        <Badges>
          <GratisBadge>GRÁTIS</GratisBadge>
          {course.level && (
            <LevelBadge $color={levelColor}>{LEVEL_LABELS[course.level]}</LevelBadge>
          )}
        </Badges>
      </Content>
    </Card>
  );
}
