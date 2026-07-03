'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styled from 'styled-components';
import { toast } from 'sonner';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/components/ui/select';
import { updateCourse } from '@/lib/instructor';

const Page = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 860px;
  margin-inline: auto;
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
  line-height: 1.5;
`;

type AccessMode = 'on_demand' | 'cohort' | 'both';

export default function ConfiguracoesPage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;

  const [accessMode, setAccessMode] = useState<AccessMode>('on_demand');
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiBase}/api/courses/${courseId}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json?.data) return;
        if (json.data.accessMode) setAccessMode(json.data.accessMode);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [courseId, apiBase]);

  async function handleAccessModeChange(mode: string) {
    const prev = accessMode;
    setAccessMode(mode as AccessMode);
    const updated = await updateCourse(courseId, { accessMode: mode as AccessMode });
    if (!updated) {
      setAccessMode(prev);
      toast.error('Erro ao salvar o modo de acesso.');
    } else {
      toast.success('Modo de acesso salvo.');
    }
  }

  return (
    <Page>
      <PageTitle>Configurações</PageTitle>

      <Card>
        <CardTitle>Modo de acesso do curso</CardTitle>
        <CardDesc>
          Define como os alunos entram no curso: no próprio ritmo (on demand), somente por
          turmas com cronograma, ou os dois — nesse caso o aluno escolhe na inscrição.
        </CardDesc>
        <div style={{ maxWidth: 320 }}>
          <Select value={accessMode} onValueChange={handleAccessModeChange} disabled={loading}>
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
    </Page>
  );
}
