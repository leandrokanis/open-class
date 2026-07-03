'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'sonner';
import { Icon } from '@/components/ui/Icon';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import {
  fetchCohorts, fetchLessonCohorts, setLessonCohorts, type CohortData,
} from '@/lib/instructor';

const Card = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const Desc = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-secondary);
`;

const Empty = styled.p`
  font-size: 12px;
  color: var(--color-text-tertiary);
`;

function cohortHint(c: CohortData): string {
  if (c.closedAt || c.status === 'encerrada') return 'Encerrada';
  const start = new Date(c.enrollmentStart).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return `Inscrições desde ${start}`;
}

interface LessonCohortsCardProps {
  lessonId: string;
  courseId: string;
  onChanged?: (cohortIds: string[]) => void;
}

export default function LessonCohortsCard({ lessonId, courseId, onChanged }: LessonCohortsCardProps) {
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCohorts(courseId), fetchLessonCohorts(lessonId)]).then(([list, current]) => {
      if (cancelled) return;
      setCohorts(list);
      setSelected(current);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [courseId, lessonId]);

  const options = useMemo<MultiSelectOption[]>(
    () => cohorts.map((c) => ({ value: c.id, label: c.name, hint: cohortHint(c) })),
    [cohorts],
  );

  async function handleChange(next: string[]) {
    const previous = selected;
    setSelected(next); // otimista
    setSaving(true);
    const result = await setLessonCohorts(lessonId, next);
    setSaving(false);
    if (result === null) {
      setSelected(previous);
      toast.error('Erro ao atualizar as turmas da aula.');
      return;
    }
    setSelected(result);
    onChanged?.(result);
    toast.success(
      result.length === 0
        ? 'Aula voltou a ser regular (visível a todos).'
        : 'Turmas exclusivas atualizadas.',
    );
  }

  return (
    <Card>
      <TitleRow>
        <Icon name="groups" size={16} />
        <Title>Turmas exclusivas</Title>
      </TitleRow>
      <Desc>
        {selected.length === 0
          ? 'Aula regular: visível para todos os alunos do curso. Escolha turmas abaixo para torná-la exclusiva.'
          : 'Aula exclusiva: só aparece para os alunos das turmas selecionadas, e some do acesso on demand e das demais turmas.'}
      </Desc>

      {loading ? (
        <Empty>Carregando turmas...</Empty>
      ) : (
        <MultiSelect
          options={options}
          selected={selected}
          onChange={handleChange}
          disabled={saving || options.length === 0}
          placeholder="Nenhuma turma (aula regular)"
          emptyMessage="Este curso ainda não tem turmas. Crie uma turma para tornar a aula exclusiva."
          summarize={(sel) =>
            sel.length === 0
              ? 'Nenhuma turma (aula regular)'
              : sel.length === 1
                ? cohorts.find((c) => c.id === sel[0])?.name ?? '1 turma'
                : `${sel.length} turmas`
          }
        />
      )}
    </Card>
  );
}
