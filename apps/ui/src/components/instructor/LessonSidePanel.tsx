'use client';

import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { updateLesson, deleteLesson } from '@/lib/instructor';
import type { LessonData } from '@/lib/instructor';
import { CourseEditorContext } from '@/app/instructor/courses/[id]/layout';
import YouTubePreview, { type VideoInfo } from './YouTubePreview';
import ResourceList from './ResourceList';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
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

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  appearance: textfield;
`;

const DurationLabel = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
`;

const EmptyPreview = styled.div`
  aspect-ratio: 16 / 9;
  background: var(--color-surface-secondary);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--color-text-secondary);
  font-size: 12px;
`;

const VisibilityTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const VisibilityTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const StatusBadge = styled.span<{ $visible: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $visible }) => ($visible ? 'var(--color-success)' : 'var(--color-text-secondary)')};
  background: ${({ $visible }) => ($visible ? 'rgba(34,197,94,0.12)' : 'var(--color-surface-secondary)')};
  border: 1px solid ${({ $visible }) => ($visible ? 'rgba(34,197,94,0.3)' : 'var(--color-border)')};
  border-radius: 20px;
  padding: 3px 10px;
`;

const VisibilityDesc = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
`;

const VisibilityActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const DangerCard = styled.div`
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(239,68,68,0.06);
`;

const DangerHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const DangerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DangerTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-destructive);
`;

const DangerDesc = styled.div`
  font-size: 12px;
  color: var(--color-destructive);
  line-height: 1.5;
  opacity: 0.8;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

interface LessonSidePanelProps {
  lesson: LessonData;
  youtubeUrl: string;
  onYoutubeUrlChange: (url: string) => void;
  durationMin: number;
  durationSec: number;
  onDurationMinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDurationSecChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoInfo: (info: VideoInfo) => void;
  onDeleted: (lessonId: string) => void;
  onUpdated: (lesson: LessonData) => void;
}

export default function LessonSidePanel({
  lesson,
  youtubeUrl,
  onYoutubeUrlChange,
  durationMin,
  durationSec,
  onDurationMinChange,
  onDurationSecChange,
  onVideoInfo,
  onDeleted,
  onUpdated,
}: LessonSidePanelProps) {
  const ctx = useContext(CourseEditorContext);
  const [visible, setVisible] = useState(lesson.visibility === 'visible');
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    setVisible(lesson.visibility === 'visible');
  }, [lesson.id]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleToggleVisible() {
    setToggling(true);
    const next = !visible;
    setVisible(next);
    const updated = await updateLesson(lesson.id, { isVisible: next });
    if (updated) {
      onUpdated(updated);
      ctx?.notifySaved();
    }
    setToggling(false);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    const ok = await deleteLesson(lesson.id);
    if (ok) onDeleted(lesson.id);
    setDeleting(false);
    setDeleteOpen(false);
  }

  return (
    <Panel>
      <Card>
        <VisibilityTitleRow>
          <VisibilityTitle>Visibilidade</VisibilityTitle>
          <StatusBadge $visible={visible}>
            <Icon name={visible ? 'visibility' : 'draft'} size={13} />
            {visible ? 'Publicada' : 'Rascunho'}
          </StatusBadge>
        </VisibilityTitleRow>
        <VisibilityDesc>
          {visible
            ? 'Alunos inscritos podem ver esta aula.'
            : 'Somente você pode ver esta aula.'}
        </VisibilityDesc>
        <VisibilityActions>
          <Button
            size="sm"
            variant={visible ? 'outline' : 'default'}
            onClick={handleToggleVisible}
            disabled={toggling}
          >
            {toggling ? 'Aguarde...' : visible ? 'Tornar rascunho' : 'Publicar'}
          </Button>
        </VisibilityActions>
      </Card>

      <Card>
        <CardTitle>Vídeo</CardTitle>

        <Field>
          <Label htmlFor="lesson-youtube">Link do YouTube</Label>
          <Input
            id="lesson-youtube"
            value={youtubeUrl}
            onChange={(e) => onYoutubeUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            type="url"
          />
        </Field>

        {youtubeUrl.trim() ? (
          <YouTubePreview url={youtubeUrl} onVideoInfo={onVideoInfo} />
        ) : (
          <EmptyPreview>
            <Icon name="play_circle" size={28} style={{ opacity: 0.35 }} />
            Nenhum vídeo vinculado
          </EmptyPreview>
        )}

        <Field>
          <Label>Duração</Label>
          <DurationRow>
            <DurationInput
              id="lesson-duration-min"
              type="number"
              min={0}
              value={durationMin}
              onChange={onDurationMinChange}
            />
            <DurationLabel>min</DurationLabel>
            <DurationInput
              id="lesson-duration-sec"
              type="number"
              min={0}
              max={59}
              value={durationSec}
              onChange={onDurationSecChange}
            />
            <DurationLabel>seg</DurationLabel>
          </DurationRow>
        </Field>
      </Card>

      <Card>
        <CardTitle>Recursos externos</CardTitle>
        <ResourceList lessonId={lesson.id} initialResources={lesson.resources} />
      </Card>

      <DangerCard>
        <DangerHeader>
          <DangerInfo>
            <DangerTitle>Zona de perigo</DangerTitle>
            <DangerDesc>Remove permanentemente esta aula e seus recursos.</DangerDesc>
          </DangerInfo>
          <Button
            size="sm"
            variant="outline"
            style={{ borderColor: 'var(--color-destructive)', color: 'var(--color-destructive)', flexShrink: 0 }}
            onClick={() => setDeleteOpen(true)}
          >
            Excluir
          </Button>
        </DangerHeader>
      </DangerCard>

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
            {deleting ? 'Excluindo...' : 'Excluir permanentemente'}
          </Button>
        </ModalFooter>
      </Dialog>
    </Panel>
  );
}
