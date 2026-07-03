'use client';

import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCourseCurriculum } from '@/components/instructor/CourseCurriculumContext';
import { fetchCohort, setCohortSchedule, type CohortScheduleEntry } from '@/lib/instructor';

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Intro = styled.p`
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
`;

const Warn = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 12px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 220px;
  align-items: center;
  gap: 12px;

  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;

const ModName = styled.span`
  font-size: 14px;
  color: var(--color-text-primary);
`;

const Status = styled.span<{ $tone: 'available' | 'future' | 'start' }>`
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
  white-space: nowrap;
  color: ${({ $tone }) =>
    $tone === 'available' ? 'var(--color-success)'
    : $tone === 'future' ? 'var(--color-primary)'
    : 'var(--color-text-secondary)'};
  background: ${({ $tone }) =>
    $tone === 'available' ? 'rgba(34,197,94,0.12)'
    : $tone === 'future' ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
    : 'var(--color-surface-secondary)'};
  border: 1px solid var(--color-border);
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusOf(value: string): { tone: 'available' | 'future' | 'start'; label: string } {
  if (!value) return { tone: 'start', label: 'Desde o início' };
  const date = new Date(value);
  const now = new Date();
  if (date <= now) return { tone: 'available', label: 'Disponível' };
  const days = Math.max(1, Math.ceil((date.getTime() - now.getTime()) / 86_400_000));
  return { tone: 'future', label: `Libera em ${days} ${days === 1 ? 'dia' : 'dias'}` };
}

export function CohortScheduleTab({ cohortId, readOnly = false }: { cohortId: string; readOnly?: boolean }) {
  const { sections } = useCourseCurriculum();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCohort(cohortId).then((detail) => {
      if (cancelled || !detail) return;
      const d: Record<string, string> = {};
      for (const entry of detail.schedule ?? []) d[entry.moduleId] = toLocalInput(entry.availableFrom);
      setDraft(d);
    });
    return () => { cancelled = true; };
  }, [cohortId]);

  const modules = useMemo(() => [...sections].sort((a, b) => a.position - b.position), [sections]);

  async function handleSave() {
    setSaving(true);
    const entries: CohortScheduleEntry[] = Object.entries(draft)
      .filter(([, v]) => v)
      .map(([moduleId, v]) => ({ moduleId, availableFrom: new Date(v).toISOString() }));
    const ok = await setCohortSchedule(cohortId, entries);
    setSaving(false);
    if (ok) toast.success('Cronograma salvo.');
    else toast.error('Erro ao salvar o cronograma.');
  }

  return (
    <Stack>
      <Intro>
        Data a partir da qual cada módulo fica disponível para os alunos da turma.
        Módulo sem data fica disponível desde o início.
      </Intro>
      {readOnly && <Warn>Turma encerrada — o cronograma não pode mais ser alterado.</Warn>}

      {modules.map((mod) => {
        const value = draft[mod.id] ?? '';
        const st = statusOf(value);
        return (
          <Row key={mod.id}>
            <ModName>{mod.title}</ModName>
            <Status $tone={st.tone}>{st.label}</Status>
            <Input
              type="datetime-local"
              value={value}
              disabled={readOnly}
              onChange={(e) => setDraft((prev) => ({ ...prev, [mod.id]: e.target.value }))}
              aria-label={`Liberação do módulo ${mod.title}`}
            />
          </Row>
        );
      })}

      {!readOnly && (
        <Footer>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar cronograma'}
          </Button>
        </Footer>
      )}
    </Stack>
  );
}
