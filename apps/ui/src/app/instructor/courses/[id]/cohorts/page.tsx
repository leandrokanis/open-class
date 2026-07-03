'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import styled from 'styled-components';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogClose } from '@/components/ui/dialog';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/components/ui/select';
import { Icon } from '@/components/ui/Icon';
import { useCourseCurriculum } from '@/components/instructor/CourseCurriculumContext';
import {
  fetchCohorts, createCohort, updateCohort, closeCohort, setCohortSchedule, fetchCohort,
  updateCourse, createLesson, fetchCohortProgress,
  type CohortData, type CohortScheduleEntry, type CohortProgress,
} from '@/lib/instructor';

const Page = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 880px;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
`;

const Card = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const CardDesc = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const CohortHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const CohortName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const StatusBadge = styled.span<{ $status: CohortData['status'] }>`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 10px;
  border-radius: 12px;
  color: ${({ $status }) =>
    $status === 'aberta' ? 'var(--color-success)'
    : $status === 'agendada' ? 'var(--color-primary)'
    : 'var(--color-text-secondary)'};
  background: ${({ $status }) =>
    $status === 'aberta' ? 'rgba(34,197,94,0.12)'
    : $status === 'agendada' ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
    : 'var(--color-surface-secondary)'};
  border: 1px solid var(--color-border);
`;

const CohortMeta = styled.div`
  font-size: 12.5px;
  color: var(--color-text-secondary);
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

const ScheduleGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
`;

const ScheduleRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 12px;
  align-items: center;

  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const ModuleName = styled.span`
  font-size: 13px;
  color: var(--color-text-primary);
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

const StudentsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;

  th {
    text-align: left;
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-tertiary);
    padding: 6px 8px;
    border-bottom: 1px solid var(--color-border);
  }

  td {
    padding: 7px 8px;
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-border);
  }
`;

const InactiveTag = styled.span`
  margin-left: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-destructive);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 1px 7px;
`;

const Empty = styled.div`
  padding: 28px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
`;

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(v: string): string {
  return new Date(v).toISOString();
}

function formatPeriod(start: string, end: string): string {
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return `${fmt(start)} — ${fmt(end)}`;
}

const STATUS_LABEL: Record<CohortData['status'], string> = {
  agendada: 'Agendada',
  aberta: 'Inscrições abertas',
  encerrada: 'Encerrada',
};

const emptyForm = { name: '', enrollmentStart: '', enrollmentEnd: '', seats: 30 };

export default function CohortsPage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const { sections } = useCourseCurriculum();

  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessMode, setAccessMode] = useState<'on_demand' | 'cohort' | 'both'>('on_demand');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CohortData | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [closingCohort, setClosingCohort] = useState<CohortData | null>(null);
  const [scheduleFor, setScheduleFor] = useState<string | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<Record<string, string>>({});
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Aulas exclusivas de turma (US-25)
  const { dispatch } = useCourseCurriculum();
  const [exclusivesFor, setExclusivesFor] = useState<string | null>(null);
  const [excForm, setExcForm] = useState({ moduleId: '', title: '', youtubeUrl: '' });
  const [savingExclusive, setSavingExclusive] = useState(false);

  // Painel de progresso (US-26)
  const [progressFor, setProgressFor] = useState<string | null>(null);
  const [progress, setProgress] = useState<CohortProgress | null>(null);

  async function toggleProgress(cohortId: string) {
    if (progressFor === cohortId) {
      setProgressFor(null);
      return;
    }
    setProgressFor(cohortId);
    setProgress(null);
    const data = await fetchCohortProgress(cohortId);
    setProgress(data);
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [list, courseRes] = await Promise.all([
        fetchCohorts(courseId),
        fetch(`${apiBase}/api/courses/${courseId}`, { credentials: 'include' }),
      ]);
      if (cancelled) return;
      setCohorts(list);
      if (courseRes.ok) {
        const json = await courseRes.json();
        if (json.data?.accessMode) setAccessMode(json.data.accessMode);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function handleAccessModeChange(mode: string) {
    const prev = accessMode;
    setAccessMode(mode as typeof accessMode);
    const updated = await updateCourse(courseId, { accessMode: mode as typeof accessMode });
    if (!updated) {
      setAccessMode(prev);
      toast.error('Erro ao salvar o modo de acesso.');
    } else {
      toast.success('Modo de acesso salvo.');
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(cohort: CohortData) {
    setEditing(cohort);
    setForm({
      name: cohort.name,
      enrollmentStart: toLocalInput(cohort.enrollmentStart),
      enrollmentEnd: toLocalInput(cohort.enrollmentEnd),
      seats: cohort.seats,
    });
    setFormOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.enrollmentStart || !form.enrollmentEnd || form.seats < 1) {
      toast.error('Preencha nome, período de inscrições e vagas.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      enrollmentStart: fromLocalInput(form.enrollmentStart),
      enrollmentEnd: fromLocalInput(form.enrollmentEnd),
      seats: Number(form.seats),
    };
    const result = editing
      ? await updateCohort(editing.id, payload)
      : await createCohort(courseId, payload);
    setSaving(false);

    if (!result) {
      toast.error('Erro ao salvar a turma. Verifique o período de inscrições.');
      return;
    }
    setCohorts((prev) =>
      editing ? prev.map((c) => (c.id === result.id ? { ...c, ...result } : c)) : [...prev, result],
    );
    setFormOpen(false);
    toast.success(editing ? 'Turma atualizada.' : 'Turma criada.');
  }

  async function handleConfirmClose() {
    if (!closingCohort) return;
    const result = await closeCohort(closingCohort.id);
    if (result) {
      setCohorts((prev) => prev.map((c) => (c.id === result.id ? { ...c, ...result } : c)));
      toast.success('Turma encerrada.');
    } else {
      toast.error('Erro ao encerrar a turma.');
    }
    setClosingCohort(null);
  }

  const openSchedule = useCallback(async (cohortId: string) => {
    if (scheduleFor === cohortId) {
      setScheduleFor(null);
      return;
    }
    const detail = await fetchCohort(cohortId);
    const draft: Record<string, string> = {};
    for (const entry of detail?.schedule ?? []) {
      draft[entry.moduleId] = toLocalInput(entry.availableFrom);
    }
    setScheduleDraft(draft);
    setScheduleFor(cohortId);
  }, [scheduleFor]);

  async function handleSaveSchedule() {
    if (!scheduleFor) return;
    setSavingSchedule(true);
    const entries: CohortScheduleEntry[] = Object.entries(scheduleDraft)
      .filter(([, v]) => v)
      .map(([moduleId, v]) => ({ moduleId, availableFrom: fromLocalInput(v) }));
    const result = await setCohortSchedule(scheduleFor, entries);
    setSavingSchedule(false);
    if (result) {
      toast.success('Cronograma salvo.');
      setScheduleFor(null);
    } else {
      toast.error('Erro ao salvar o cronograma.');
    }
  }

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.position - b.position),
    [sections],
  );

  const exclusivesByCohort = useMemo(() => {
    const map: Record<string, Array<{ id: string; title: string; moduleTitle: string }>> = {};
    for (const mod of sortedSections) {
      for (const lesson of mod.lessons ?? []) {
        if (!lesson.cohortId) continue;
        (map[lesson.cohortId] ??= []).push({ id: lesson.id, title: lesson.title, moduleTitle: mod.title });
      }
    }
    return map;
  }, [sortedSections]);

  async function handleCreateExclusive() {
    if (!exclusivesFor || !excForm.moduleId || !excForm.title.trim()) {
      toast.error('Escolha o módulo e informe o título da aula exclusiva.');
      return;
    }
    setSavingExclusive(true);
    const lesson = await createLesson(excForm.moduleId, {
      title: excForm.title.trim(),
      ...(excForm.youtubeUrl.trim() ? { youtubeUrl: excForm.youtubeUrl.trim() } : {}),
      cohortId: exclusivesFor,
    });
    setSavingExclusive(false);
    if (!lesson) {
      toast.error('Erro ao criar a aula exclusiva.');
      return;
    }
    dispatch({ type: 'ADD_LESSON', moduleId: excForm.moduleId, lesson });
    setExcForm({ moduleId: '', title: '', youtubeUrl: '' });
    toast.success('Aula exclusiva criada (em rascunho). Publique-a no currículo.');
  }

  if (loading) {
    return <Page><CardDesc>Carregando turmas...</CardDesc></Page>;
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>Turmas</PageTitle>
        <Button size="sm" onClick={openCreate}>
          <Icon name="add" size={15} />
          Nova turma
        </Button>
      </PageHeader>

      <Card>
        <CardTitle>Modo de acesso do curso</CardTitle>
        <CardDesc>
          Define como os alunos entram no curso: no próprio ritmo (on demand), somente por
          turmas com cronograma, ou os dois — nesse caso o aluno escolhe na inscrição.
        </CardDesc>
        <div style={{ maxWidth: 320 }}>
          <Select value={accessMode} onValueChange={handleAccessModeChange}>
            <SelectTrigger aria-label="Modo de acesso do curso">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on_demand">Somente on demand</SelectItem>
              <SelectItem value="cohort">Somente via turma</SelectItem>
              <SelectItem value="both">Ambos — o aluno escolhe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {cohorts.length === 0 ? (
        <Empty>
          Nenhuma turma ainda. Crie a primeira para oferecer o curso com cronograma e vagas limitadas.
        </Empty>
      ) : (
        cohorts.map((cohort) => (
          <Card key={cohort.id}>
            <CohortHeader>
              <CohortName>{cohort.name}</CohortName>
              <StatusBadge $status={cohort.status}>{STATUS_LABEL[cohort.status]}</StatusBadge>
              <Actions>
                <Button size="sm" variant="outline" onClick={() => toggleProgress(cohort.id)}>
                  <Icon name="monitoring" size={14} />
                  Progresso
                </Button>
                <Button size="sm" variant="outline" onClick={() => openSchedule(cohort.id)}>
                  <Icon name="calendar_month" size={14} />
                  Cronograma
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExclusivesFor(exclusivesFor === cohort.id ? null : cohort.id)}
                >
                  <Icon name="star" size={14} />
                  Exclusivas
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(cohort)}>
                  Editar
                </Button>
                {cohort.status !== 'encerrada' && (
                  <Button size="sm" variant="outline" onClick={() => setClosingCohort(cohort)}>
                    Encerrar
                  </Button>
                )}
              </Actions>
            </CohortHeader>
            <CohortMeta>
              <span>Inscrições: {formatPeriod(cohort.enrollmentStart, cohort.enrollmentEnd)}</span>
              <span>{cohort.seats} vagas</span>
            </CohortMeta>

            {progressFor === cohort.id && (
              <ScheduleGrid>
                {!progress ? (
                  <CardDesc>Carregando progresso...</CardDesc>
                ) : (
                  <>
                    <CohortMeta>
                      <span><b>{progress.summary.enrolledCount}</b> inscritos</span>
                      <span><b>{progress.summary.seatsLeft}</b> vagas restantes</span>
                      <span><b>{progress.summary.avgCompletion}%</b> de conclusão média</span>
                    </CohortMeta>

                    {progress.students.length > 0 && (
                      <StudentsTable>
                        <thead>
                          <tr>
                            <th>Aluno</th>
                            <th>Progresso</th>
                            <th>Última aula</th>
                            <th>Acesso</th>
                          </tr>
                        </thead>
                        <tbody>
                          {progress.students.map((s) => (
                            <tr key={s.id}>
                              <td>
                                {s.name}
                                {s.inactive && <InactiveTag title="Sem acesso nos últimos 7 dias">inativo</InactiveTag>}
                              </td>
                              <td>{s.progressPct}%</td>
                              <td>{s.lastLessonTitle ?? '—'}</td>
                              <td>
                                {s.lastAccessAt
                                  ? new Date(s.lastAccessAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                                  : 'nunca'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </StudentsTable>
                    )}

                    {progress.modules.length > 0 && (
                      <>
                        <CardDesc>Conclusões por módulo</CardDesc>
                        {progress.modules.map((m) => (
                          <ScheduleRow key={m.moduleId}>
                            <ModuleName>{m.title}</ModuleName>
                            <CardDesc>
                              {m.completedCount} de {progress.summary.enrolledCount} concluíram
                            </CardDesc>
                          </ScheduleRow>
                        ))}
                      </>
                    )}
                  </>
                )}
              </ScheduleGrid>
            )}

            {exclusivesFor === cohort.id && (
              <ScheduleGrid>
                <CardDesc>
                  Aulas exclusivas desta turma: não aparecem no on demand nem em outras
                  turmas, e ficam inacessíveis após o encerramento.
                </CardDesc>
                {(exclusivesByCohort[cohort.id] ?? []).map((lesson) => (
                  <ScheduleRow key={lesson.id}>
                    <ModuleName>
                      <Icon name="star" size={12} style={{ verticalAlign: -2, marginRight: 6 }} />
                      {lesson.title}
                    </ModuleName>
                    <CardDesc>{lesson.moduleTitle}</CardDesc>
                  </ScheduleRow>
                ))}
                {(exclusivesByCohort[cohort.id] ?? []).length === 0 && (
                  <CardDesc>Nenhuma aula exclusiva ainda.</CardDesc>
                )}
                <ScheduleRow>
                  <Select
                    value={excForm.moduleId || undefined}
                    onValueChange={(v) => setExcForm((p) => ({ ...p, moduleId: v }))}
                  >
                    <SelectTrigger aria-label="Módulo da aula exclusiva">
                      <SelectValue placeholder="Escolha o módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedSections.map((mod) => (
                        <SelectItem key={mod.id} value={mod.id}>{mod.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Título da aula exclusiva"
                    value={excForm.title}
                    onChange={(e) => setExcForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </ScheduleRow>
                <ScheduleRow>
                  <Input
                    placeholder="Link do YouTube (opcional)"
                    type="url"
                    value={excForm.youtubeUrl}
                    onChange={(e) => setExcForm((p) => ({ ...p, youtubeUrl: e.target.value }))}
                  />
                  <Button size="sm" onClick={handleCreateExclusive} disabled={savingExclusive}>
                    {savingExclusive ? 'Criando...' : 'Adicionar exclusiva'}
                  </Button>
                </ScheduleRow>
              </ScheduleGrid>
            )}

            {scheduleFor === cohort.id && (
              <ScheduleGrid>
                <CardDesc>
                  Data a partir da qual cada módulo fica disponível para os alunos da turma.
                  Módulo sem data fica disponível desde o início.
                </CardDesc>
                {sortedSections.map((mod) => (
                  <ScheduleRow key={mod.id}>
                    <ModuleName>{mod.title}</ModuleName>
                    <Input
                      type="datetime-local"
                      value={scheduleDraft[mod.id] ?? ''}
                      onChange={(e) =>
                        setScheduleDraft((prev) => ({ ...prev, [mod.id]: e.target.value }))
                      }
                      aria-label={`Liberação do módulo ${mod.title}`}
                    />
                  </ScheduleRow>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <Button size="sm" variant="outline" onClick={() => setScheduleFor(null)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveSchedule} disabled={savingSchedule}>
                    {savingSchedule ? 'Salvando...' : 'Salvar cronograma'}
                  </Button>
                </div>
              </ScheduleGrid>
            )}
          </Card>
        ))
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(o) => { if (!saving) setFormOpen(o); }}
        title={editing ? 'Editar turma' : 'Nova turma'}
        description={editing ? undefined : 'Defina nome, período de inscrições e vagas.'}
      >
        <FormGrid>
          <Field>
            <Label htmlFor="cohort-name">Nome da turma</Label>
            <Input
              id="cohort-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Digite o nome da turma"
            />
          </Field>
          <TwoCols>
            <Field>
              <Label htmlFor="cohort-start">Início das inscrições</Label>
              <Input
                id="cohort-start"
                type="datetime-local"
                value={form.enrollmentStart}
                onChange={(e) => setForm((p) => ({ ...p, enrollmentStart: e.target.value }))}
              />
            </Field>
            <Field>
              <Label htmlFor="cohort-end">Fim das inscrições</Label>
              <Input
                id="cohort-end"
                type="datetime-local"
                value={form.enrollmentEnd}
                onChange={(e) => setForm((p) => ({ ...p, enrollmentEnd: e.target.value }))}
              />
            </Field>
          </TwoCols>
          <Field>
            <Label htmlFor="cohort-seats">Vagas</Label>
            <Input
              id="cohort-seats"
              type="number"
              min={1}
              value={form.seats}
              onChange={(e) => setForm((p) => ({ ...p, seats: Number(e.target.value) }))}
              style={{ maxWidth: 140 }}
            />
          </Field>
        </FormGrid>
        <ModalFooter>
          <DialogClose asChild>
            <Button size="sm" variant="outline" disabled={saving}>Cancelar</Button>
          </DialogClose>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar turma'}
          </Button>
        </ModalFooter>
      </Dialog>

      <Dialog
        open={closingCohort !== null}
        onOpenChange={(o) => { if (!o) setClosingCohort(null); }}
        title="Encerrar turma"
        description={
          closingCohort
            ? `"${closingCohort.name}" não aceitará novas inscrições após o encerramento.`
            : undefined
        }
      >
        <ModalFooter>
          <DialogClose asChild>
            <Button size="sm" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button size="sm" variant="destructive" onClick={handleConfirmClose}>
            Encerrar turma
          </Button>
        </ModalFooter>
      </Dialog>
    </Page>
  );
}
