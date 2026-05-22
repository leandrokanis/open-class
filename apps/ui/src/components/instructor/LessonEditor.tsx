'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import styled from 'styled-components';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { updateLesson, deleteLesson } from '@/lib/instructor';
import type { LessonData } from '@/lib/instructor';
import { CourseEditorContext } from '@/app/instructor/cursos/[id]/layout';
import YouTubePreview, { type VideoInfo } from './YouTubePreview';
import ResourceList from './ResourceList';

const AUTOSAVE_DELAY = 1000;

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

const DurationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DurationInput = styled(Input)`
  width: 80px;
  text-align: center;
`;

const DurationLabel = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
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

const DangerZone = styled.div`
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

function secondsToMinSec(seconds: number | null): { min: number; sec: number } {
  if (!seconds) return { min: 0, sec: 0 };
  return { min: Math.floor(seconds / 60), sec: seconds % 60 };
}

interface LessonEditorProps {
  lesson: LessonData;
  onDeleted: (lessonId: string) => void;
  onUpdated: (lesson: LessonData) => void;
}

export default function LessonEditor({ lesson, onDeleted, onUpdated }: LessonEditorProps) {
  const ctx = useContext(CourseEditorContext);

  const initial = secondsToMinSec(lesson.duration);
  const [title, setTitle] = useState(lesson.title);
  const [youtubeUrl, setYoutubeUrl] = useState(lesson.youtubeUrl ?? '');
  const [description, setDescription] = useState(lesson.description ?? '');
  const [durationMin, setDurationMin] = useState(initial.min);
  const [durationSec, setDurationSec] = useState(initial.sec);
  const [visible, setVisible] = useState(lesson.visibility === 'visible');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    isInitialMount.current = true;
    const d = secondsToMinSec(lesson.duration);
    setTitle(lesson.title);
    setYoutubeUrl(lesson.youtubeUrl ?? '');
    setDescription(lesson.description ?? '');
    setDurationMin(d.min);
    setDurationSec(d.sec);
    setVisible(lesson.visibility === 'visible');
  }, [lesson.id]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    const duration = durationMin * 60 + durationSec;

    timerRef.current = setTimeout(async () => {
      const updated = await updateLesson(lesson.id, {
        title: title.trim(),
        youtubeUrl: youtubeUrl.trim() || undefined,
        description: description.trim() || undefined,
        duration,
      });

      if (updated) {
        onUpdated(updated);
        ctx?.notifySaved();
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, youtubeUrl, description, durationMin, durationSec]);

  function handleVideoInfo(info: VideoInfo) {
    if (info.durationSeconds !== null) {
      const d = secondsToMinSec(info.durationSeconds);
      setDurationMin(d.min);
      setDurationSec(d.sec);
    }
  }

  function handleDurationMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.max(0, parseInt(e.target.value, 10) || 0);
    setDurationMin(v);
  }

  function handleDurationSecChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0));
    setDurationSec(v);
  }

  async function handleToggleVisible(checked: boolean) {
    setVisible(checked);
    const updated = await updateLesson(lesson.id, { isVisible: checked });
    if (updated) {
      onUpdated(updated);
      ctx?.notifySaved();
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    const ok = await deleteLesson(lesson.id);
    if (ok) onDeleted(lesson.id);
    setDeleting(false);
    setDeleteOpen(false);
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
        <YouTubePreview url={youtubeUrl} onVideoInfo={handleVideoInfo} />
      </Field>

      <Field>
        <Label>Duração da aula</Label>
        <DurationRow>
          <DurationInput
            id="lesson-duration-min"
            type="number"
            min={0}
            value={durationMin}
            onChange={handleDurationMinChange}
          />
          <DurationLabel>min</DurationLabel>
          <DurationInput
            id="lesson-duration-sec"
            type="number"
            min={0}
            max={59}
            value={durationSec}
            onChange={handleDurationSecChange}
          />
          <DurationLabel>seg</DurationLabel>
        </DurationRow>
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

      <DangerZone>
        <Button
          size="sm"
          variant="outline"
          style={{ color: 'var(--color-destructive)', borderColor: 'var(--color-destructive)' }}
          onClick={() => setDeleteOpen(true)}
        >
          <Icon name="delete" size={14} />
          Excluir aula
        </Button>
      </DangerZone>

      <Dialog
        open={deleteOpen}
        onOpenChange={(o) => { if (!deleting) setDeleteOpen(o); }}
        title="Excluir aula"
        description={`"${lesson.title}" será removida permanentemente.`}
      >
        <ModalFooter>
          <DialogClose asChild>
            <Button size="sm" variant="outline" disabled={deleting}>Cancelar</Button>
          </DialogClose>
          <Button size="sm" variant="destructive" disabled={deleting} onClick={handleConfirmDelete}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </ModalFooter>
      </Dialog>
    </Wrapper>
  );
}

export function LessonEditorEmpty() {
  return (
    <EmptyState>Selecione uma aula no currículo para editá-la.</EmptyState>
  );
}
