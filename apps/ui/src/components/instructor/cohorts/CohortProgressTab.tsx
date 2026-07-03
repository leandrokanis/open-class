'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchCohortProgress, type CohortProgress } from '@/lib/instructor';
import { StatTiles } from './StatTiles';
import { StudentList } from './StudentList';
import { AttentionSection } from './AttentionSection';
import { ModuleFunnel } from './ModuleFunnel';

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Loading = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: 8px 0;
`;

export function CohortProgressTab({ cohortId }: { cohortId: string }) {
  const [progress, setProgress] = useState<CohortProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCohortProgress(cohortId).then((data) => {
      if (cancelled) return;
      setProgress(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [cohortId]);

  if (loading) return <Loading>Carregando progresso...</Loading>;
  if (!progress) return <Loading>Não foi possível carregar o progresso.</Loading>;

  const active = progress.students.filter((s) => !s.inactive);
  const inactive = progress.students.filter((s) => s.inactive);

  return (
    <Stack>
      <StatTiles {...progress.summary} />
      <StudentList students={active} />
      <AttentionSection students={inactive} />
      <ModuleFunnel modules={progress.modules} enrolledCount={progress.summary.enrolledCount} />
    </Stack>
  );
}
