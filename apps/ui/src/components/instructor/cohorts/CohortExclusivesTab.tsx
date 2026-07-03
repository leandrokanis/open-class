'use client';

import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/components/ui/select';
import { useCourseCurriculum } from '@/components/instructor/CourseCurriculumContext';
import { createLesson, deleteLesson } from '@/lib/instructor';

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

const Item = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
`;

const ExcTitle = styled.span`
  font-size: 14px;
  color: var(--color-text-primary);
`;

const ModTag = styled.span`
  font-size: 12px;
  color: var(--color-text-tertiary);
`;

const Empty = styled.p`
  font-size: 13px;
  color: var(--color-text-tertiary);
  padding: 4px 0;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 14px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

function fmtDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : `${m}min`;
}

export function CohortExclusivesTab({ cohortId, readOnly = false }: { cohortId: string; readOnly?: boolean }) {
  const { sections, dispatch } = useCourseCurriculum();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ moduleId: '', title: '', youtubeUrl: '' });
  const [saving, setSaving] = useState(false);

  const modules = useMemo(() => [...sections].sort((a, b) => a.position - b.position), [sections]);
  const exclusives = useMemo(
    () => modules.flatMap((m) =>
      (m.lessons ?? []).filter((l) => l.cohortId === cohortId).map((l) => ({ ...l, moduleTitle: m.title }))),
    [modules, cohortId],
  );

  async function handleCreate() {
    if (!form.moduleId || !form.title.trim()) {
      toast.error('Escolha o módulo e informe o título.');
      return;
    }
    setSaving(true);
    const lesson = await createLesson(form.moduleId, {
      title: form.title.trim(),
      ...(form.youtubeUrl.trim() ? { youtubeUrl: form.youtubeUrl.trim() } : {}),
      cohortId,
    });
    setSaving(false);
    if (!lesson) return toast.error('Erro ao criar a aula exclusiva.');
    dispatch({ type: 'ADD_LESSON', moduleId: form.moduleId, lesson });
    setForm({ moduleId: '', title: '', youtubeUrl: '' });
    setAdding(false);
    toast.success('Aula exclusiva criada (em rascunho). Publique-a no currículo.');
  }

  async function handleRemove(lessonId: string) {
    const ok = await deleteLesson(lessonId);
    if (!ok) return toast.error('Erro ao remover a aula.');
    dispatch({ type: 'DELETE_LESSON', lessonId });
    toast.success('Aula exclusiva removida.');
  }

  return (
    <Stack>
      <Intro>
        Aulas exclusivas desta turma: não aparecem no on demand nem em outras turmas,
        e ficam inacessíveis após o encerramento.
      </Intro>
      {readOnly && <Warn>Turma encerrada — as aulas exclusivas não podem mais ser alteradas.</Warn>}

      {exclusives.length === 0
        ? <Empty>Nenhuma aula exclusiva ainda.</Empty>
        : exclusives.map((l) => (
          <Item key={l.id}>
            <Icon name="star" size={15} style={{ color: 'var(--color-primary)' }} />
            <ExcTitle>{l.title}</ExcTitle>
            <ModTag>{l.moduleTitle}{l.duration ? ` · ${fmtDuration(l.duration)}` : ''}</ModTag>
            {!readOnly && (
              <Button size="sm" variant="ghost" onClick={() => handleRemove(l.id)} aria-label="Remover">
                <Icon name="delete" size={14} />
              </Button>
            )}
          </Item>
        ))}

      {!readOnly && (adding ? (
        <Form>
          <FormRow>
            <Select value={form.moduleId || undefined} onValueChange={(v) => setForm((p) => ({ ...p, moduleId: v }))}>
              <SelectTrigger aria-label="Módulo"><SelectValue placeholder="Escolha o módulo" /></SelectTrigger>
              <SelectContent>
                {modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              placeholder="Título da aula exclusiva"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </FormRow>
          <Input
            placeholder="Link do YouTube (opcional)"
            type="url"
            value={form.youtubeUrl}
            onChange={(e) => setForm((p) => ({ ...p, youtubeUrl: e.target.value }))}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleCreate} disabled={saving}>
              {saving ? 'Criando...' : 'Adicionar exclusiva'}
            </Button>
          </div>
        </Form>
      ) : (
        <div>
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Icon name="add" size={14} />
            Adicionar aula exclusiva
          </Button>
        </div>
      ))}
    </Stack>
  );
}
