'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Icon } from '@/components/ui/Icon';
import { fetchCohort, type CohortData } from '@/lib/instructor';
import { CohortDetailHeader } from '@/components/instructor/cohorts/CohortDetailHeader';
import { CohortTabs } from '@/components/instructor/cohorts/CohortTabs';

const Page = styled.div`
  padding: 24px 32px 48px;
  max-width: 900px;
`;

const Back = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  color: var(--color-text-secondary);
  padding: 0;
  margin-bottom: 16px;

  &:hover { color: var(--color-text-primary); }
`;

const Loading = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
`;

export default function CohortDetailPage() {
  const params = useParams<{ id: string; cohortId: string }>();
  const router = useRouter();
  const [cohort, setCohort] = useState<CohortData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCohort(params.cohortId).then((data) => {
      if (cancelled) return;
      setCohort(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [params.cohortId]);

  return (
    <Page>
      <Back onClick={() => router.push(`/instructor/courses/${params.id}/cohorts`)}>
        <Icon name="chevron_left" size={16} />
        Turmas
      </Back>

      {loading && <Loading>Carregando turma...</Loading>}
      {!loading && !cohort && <Loading>Turma não encontrada.</Loading>}
      {cohort && (
        <>
          <CohortDetailHeader courseId={params.id} cohort={cohort} onChanged={setCohort} />
          <CohortTabs cohortId={cohort.id} readOnly={cohort.status === 'encerrada'} />
        </>
      )}
    </Page>
  );
}
