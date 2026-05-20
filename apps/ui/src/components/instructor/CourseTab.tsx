'use client';

import styled from 'styled-components';
import { CourseInfoForm } from './CourseInfoForm';
import { CourseSidePanel } from './CourseSidePanel';
import type { CourseEditorData, Category } from '@/lib/instructor';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
  padding: 32px;
`;

interface CourseTabProps {
  course: CourseEditorData;
  categories: Category[];
}

export default function CourseTab({ course, categories }: CourseTabProps) {
  return (
    <Grid>
      <CourseInfoForm course={course} />
      <CourseSidePanel course={course} categories={categories} />
    </Grid>
  );
}
