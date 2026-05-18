import styled from "styled-components";
import { CourseCard } from "./CourseCard";
import type { CourseListItem } from "@/lib/catalog";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const Empty = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 0;
  color: var(--color-text-secondary);
  font-size: 15px;
`;

interface CourseGridProps {
  courses: CourseListItem[];
  searchTerm?: string;
}

export function CourseGrid({ courses, searchTerm }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <Grid>
        <Empty>
          {searchTerm
            ? `Nenhum curso encontrado para "${searchTerm}"`
            : "Nenhum curso disponível"}
        </Empty>
      </Grid>
    );
  }

  return (
    <Grid>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </Grid>
  );
}
