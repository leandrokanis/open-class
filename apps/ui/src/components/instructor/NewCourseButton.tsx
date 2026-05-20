'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createCourse } from '@/lib/instructor';

export function NewCourseButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const course = await createCourse({ title: 'Novo Curso' });
    if (course) {
      router.push(`/instructor/cursos/${course.id}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handleClick} disabled={loading}>
      {loading ? 'Criando...' : '+ Novo Curso'}
    </Button>
  );
}
