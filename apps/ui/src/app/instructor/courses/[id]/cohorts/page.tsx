'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { fetchCohorts, type CohortData } from '@/lib/instructor';
import { CohortList } from '@/components/instructor/cohorts/CohortList';
import { CohortFormModal } from '@/components/instructor/cohorts/CohortFormModal';

const Page = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 900px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
`;

const Empty = styled.div`
  padding: 28px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
`;

const Loading = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
`;

export default function CohortsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const courseId = params.id;

  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCohorts(courseId).then((list) => {
      if (cancelled) return;
      setCohorts(list);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [courseId]);

  // Ao criar, vai direto ao detalhe na aba Cronograma para configurar a turma.
  function handleCreated(cohort: CohortData) {
    router.push(`/instructor/courses/${courseId}/cohorts/${cohort.id}?tab=cronograma`);
  }

  return (
    <Page>
      <Header>
        <Title>Turmas</Title>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Icon name="add" size={15} />
          Nova turma
        </Button>
      </Header>

      {loading ? (
        <Loading>Carregando turmas...</Loading>
      ) : cohorts.length === 0 ? (
        <Empty>
          Nenhuma turma ainda. Crie a primeira para oferecer o curso com cronograma e vagas limitadas.
        </Empty>
      ) : (
        <CohortList courseId={courseId} cohorts={cohorts} />
      )}

      <CohortFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        courseId={courseId}
        cohort={null}
        onSaved={handleCreated}
      />
    </Page>
  );
}
