'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { updateLesson, deleteLesson } from '@/lib/instructor';
import type { LessonData } from '@/lib/instructor';
import YouTubePreview from './YouTubePreview';
import ResourceList from './ResourceList';

const Wrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 14px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const VisibilityRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
`;

const SaveRow = styled.div`
  display: flex;
  gap: 8px;
`;

interface LessonEditorProps {
  lesson: LessonData;
  onDeleted: (lessonId: string) => void;
  onUpdated: (lesson: LessonData) => void;
}

export default function LessonEditor({ lesson, onDeleted, onUpdated }: LessonEditorProps) {
  const [title, setTitle] = useState(lesson.title);
  const [youtubeUrl, setYoutubeUrl] = useState(lesson.youtubeUrl ?? '');
  const [description, setDescription] = useState(lesson.description ?? '');
  const [visible, setVisible] = useState(lesson.visibility === 'visible');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(lesson.title);
    setYoutubeUrl(lesson.youtubeUrl ?? '');
    setDescription(lesson.description ?? '');
    setVisible(lesson.visibility === 'visible');
  }, [lesson.id]);

  async function handleToggleVisible(checked: boolean) {
    setVisible(checked);
    const updated = await updateLesson(lesson.id, { isVisible: checked });
    if (updated) onUpdated(updated);
  }

  async function handleSave() {
    setSaving(true);
    const updated = await updateLesson(lesson.id, {
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim() || undefined,
      description: description.trim() || undefined,
    });
    if (updated) onUpdated(updated);
    setSaving(false);
  }

  async function handleDelete() {
    if (!window.confirm(`Excluir a aula "${lesson.title}"? Esta ação não pode ser desfeita.`)) return;
    const ok = await deleteLesson(lesson.id);
    if (ok) onDeleted(lesson.id);
  }

  return (
    <Wrapper>
      <Field>
        <Label htmlFor="lesson-title">Título da aula</Label>
        <Input
          id="lesson-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da aula"
        />
      </Field>

      <Field>
        <Label htmlFor="lesson-youtube">Link do YouTube</Label>
        <Input
          id="lesson-youtube"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          type="url"
        />
        <YouTubePreview url={youtubeUrl} />
      </Field>

      <Field>
        <Label htmlFor="lesson-description">Descrição (opcional)</Label>
        <Textarea
          id="lesson-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o conteúdo desta aula..."
        />
      </Field>

      <Field>
        <Label>Recursos externos</Label>
        <ResourceList lessonId={lesson.id} initialResources={lesson.resources} />
      </Field>

      <VisibilityRow>
        <Label htmlFor="lesson-visible">Aula visível para os alunos</Label>
        <Switch id="lesson-visible" checked={visible} onCheckedChange={handleToggleVisible} />
      </VisibilityRow>

      <SaveRow>
        <Button size="sm" onClick={handleSave} disabled={saving || !title.trim()}>
          {saving ? 'Salvando...' : 'Salvar aula'}
        </Button>
        <Button size="sm" variant="outline" onClick={handleDelete} style={{ color: 'var(--color-destructive)', borderColor: 'var(--color-destructive)' }}>
          Excluir aula
        </Button>
      </SaveRow>
    </Wrapper>
  );
}

export function LessonEditorEmpty() {
  return (
    <EmptyState>Selecione uma aula no currículo para editá-la.</EmptyState>
  );
}
