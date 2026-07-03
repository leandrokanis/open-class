'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose } from '@/components/ui/dialog';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/components/ui/select';
import { createCohort, updateCohort, type CohortData } from '@/lib/instructor';

type DurationUnit = 'days' | 'weeks' | 'months';

const UNIT_LABEL: Record<DurationUnit, string> = { days: 'dias', weeks: 'semanas', months: 'meses' };

function addDuration(startLocal: string, value: number, unit: DurationUnit): Date {
  const d = new Date(startLocal);
  if (unit === 'days') d.setDate(d.getDate() + value);
  else if (unit === 'weeks') d.setDate(d.getDate() + value * 7);
  else d.setMonth(d.getMonth() + value);
  return d;
}

function deriveDuration(startIso: string, endIso: string): { value: number; unit: DurationUnit } {
  const start = new Date(startIso);
  const end = new Date(endIso);
  for (let n = 1; n <= 36; n++) {
    const probe = new Date(start);
    probe.setMonth(probe.getMonth() + n);
    if (probe.getTime() === end.getTime()) return { value: n, unit: 'months' };
  }
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (days > 0 && days % 7 === 0) return { value: days / 7, unit: 'weeks' };
  return { value: Math.max(1, days), unit: 'days' };
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const FormGrid = styled.div`display: flex; flex-direction: column; gap: 14px; margin-top: 16px;`;
const Field = styled.div`display: flex; flex-direction: column; gap: 6px;`;
const TwoCols = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;
const Preview = styled.p`font-size: 12px; color: var(--color-text-secondary);`;
const Footer = styled.div`display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;`;

const emptyForm = { name: '', enrollmentStart: '', durationValue: 2, durationUnit: 'weeks' as DurationUnit, seats: 30 };

interface CohortFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  /** null = criar; caso contrário edita a turma dada */
  cohort: CohortData | null;
  onSaved: (cohort: CohortData) => void;
}

export function CohortFormModal({ open, onOpenChange, courseId, cohort, onSaved }: CohortFormModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const editing = cohort !== null;

  useEffect(() => {
    if (!open) return;
    if (cohort) {
      const dur = deriveDuration(cohort.enrollmentStart, cohort.enrollmentEnd);
      setForm({
        name: cohort.name,
        enrollmentStart: toLocalInput(cohort.enrollmentStart),
        durationValue: dur.value,
        durationUnit: dur.unit,
        seats: cohort.seats,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, cohort]);

  async function handleSubmit() {
    if (!form.name.trim() || !form.enrollmentStart || form.durationValue < 1 || form.seats < 1) {
      toast.error('Preencha nome, início das inscrições, duração e vagas.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      enrollmentStart: new Date(form.enrollmentStart).toISOString(),
      enrollmentEnd: addDuration(form.enrollmentStart, Number(form.durationValue), form.durationUnit).toISOString(),
      seats: Number(form.seats),
    };
    const result = editing ? await updateCohort(cohort!.id, payload) : await createCohort(courseId, payload);
    setSaving(false);
    if (!result) {
      toast.error('Erro ao salvar a turma. Verifique o período de inscrições.');
      return;
    }
    onSaved(result);
    onOpenChange(false);
    toast.success(editing ? 'Turma atualizada.' : 'Turma criada.');
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => { if (!saving) onOpenChange(o); }}
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
            <Label htmlFor="cohort-duration">Ficam abertas por</Label>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                id="cohort-duration"
                type="number"
                min={1}
                value={form.durationValue}
                onChange={(e) => setForm((p) => ({ ...p, durationValue: Number(e.target.value) }))}
                style={{ maxWidth: 90 }}
              />
              <Select
                value={form.durationUnit}
                onValueChange={(v) => setForm((p) => ({ ...p, durationUnit: v as DurationUnit }))}
              >
                <SelectTrigger aria-label="Unidade da duração"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">{UNIT_LABEL.days}</SelectItem>
                  <SelectItem value="weeks">{UNIT_LABEL.weeks}</SelectItem>
                  <SelectItem value="months">{UNIT_LABEL.months}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Field>
        </TwoCols>
        {form.enrollmentStart && form.durationValue >= 1 && (
          <Preview>
            Inscrições abertas de{' '}
            {new Date(form.enrollmentStart).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            {' '}até{' '}
            {addDuration(form.enrollmentStart, Number(form.durationValue), form.durationUnit)
              .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}.
          </Preview>
        )}
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
      <Footer>
        <DialogClose asChild>
          <Button size="sm" variant="outline" disabled={saving}>Cancelar</Button>
        </DialogClose>
        <Button size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar turma'}
        </Button>
      </Footer>
    </Dialog>
  );
}
