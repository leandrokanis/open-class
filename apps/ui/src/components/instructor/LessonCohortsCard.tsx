'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@/components/ui/Icon';
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

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Row = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  cursor: pointer;
  border-top: 1px solid var(--color-border);

  &:first-of-type { border-top: none; }
`;

const CohortInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const CohortName = styled.span`
  font-size: 13px;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CohortMeta = styled.span<{ $closed: boolean }>`
  font-size: 11px;
  color: ${({ $closed }) => ($closed ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)')};
`;

const Empty = styled.p`
  font-size: 12px;
  color: var(--color-text-tertiary);
`;

function cohortMeta(c: CohortData): { label: string; closed: boolean } {
  if (c.closedAt || c.status === 'encerrada') return { label: 'Encerrada', closed: true };
  const start = new Date(c.enrollmentStart).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return { label: `Inscrições desde ${start}`, closed: false };
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

  async function toggle(cohortId: string, on: boolean) {
    const next = on ? [...selected, cohortId] : selected.filter((id) => id !== cohortId);
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
          ? 'Aula regular: visível para todos os alunos do curso. Ative turmas abaixo para torná-la exclusiva.'
          : 'Aula exclusiva: só aparece para os alunos das turmas selecionadas, e some do acesso on demand e das demais turmas.'}
      </Desc>

      {loading ? (
        <Empty>Carregando turmas...</Empty>
      ) : cohorts.length === 0 ? (
        <Empty>Este curso ainda não tem turmas. Crie uma turma para tornar a aula exclusiva.</Empty>
      ) : (
        <List>
          {cohorts.map((c) => {
            const meta = cohortMeta(c);
            return (
              <Row key={c.id} htmlFor={`cohort-${c.id}`}>
                <CohortInfo>
                  <CohortName>{c.name}</CohortName>
                  <CohortMeta $closed={meta.closed}>{meta.label}</CohortMeta>
                </CohortInfo>
                <Switch
                  id={`cohort-${c.id}`}
                  checked={selected.includes(c.id)}
                  onCheckedChange={(on) => toggle(c.id, on)}
                  disabled={saving}
                  aria-label={`Tornar exclusiva da turma ${c.name}`}
                />
              </Row>
            );
          })}
        </List>
      )}
    </Card>
  );
}
