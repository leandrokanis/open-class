'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { updateLesson } from '@/lib/instructor';
import type { LessonData } from '@/lib/instructor';
import { CourseEditorContext } from '@/app/instructor/courses/[id]/layout';
import { usePropertiesPanel } from '@/components/instructor/PropertiesPanelContext';
import LessonSidePanel from './LessonSidePanel';
import type { VideoInfo } from './YouTubePreview';

const AUTOSAVE_DELAY = 1000;

const EditorOuter = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 0px);
  overflow: hidden;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 40px 48px;
`;

const TitleInput = styled(Input)`
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  width: 100%;
  margin-bottom: 6px;

  &:focus {
    box-shadow: none;
    border: none;
    outline: none;
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

const Subtitle = styled.p`
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-bottom: 32px;
`;

const DescLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  font-size: 14px;
  height: calc(100vh - 53px);
`;

function secondsToMinSec(seconds: number | null): { min: number; sec: number } {
  if (!seconds) return { min: 0, sec: 0 };
  return { min: Math.floor(seconds / 60), sec: seconds % 60 };
}

function formatDuration(min: number, sec: number): string {
  if (!min && !sec) return '';
  return `${min} min ${sec.toString().padStart(2, '0')} seg`;
}

interface LessonEditorProps {
  lesson: LessonData;
  sectionLabel?: string;
  onDeleted: (lessonId: string) => void;
  onUpdated: (lesson: LessonData) => void;
}

export default function LessonEditor({ lesson, sectionLabel = '', onDeleted, onUpdated }: LessonEditorProps) {
  const ctx = useContext(CourseEditorContext);
  const { target: propertiesTarget, setHasPanel } = usePropertiesPanel();

  const initial = secondsToMinSec(lesson.duration);
  const [title, setTitle] = useState(lesson.title);
  const [youtubeUrl, setYoutubeUrl] = useState(lesson.youtubeUrl ?? '');
  const [description, setDescription] = useState(lesson.description ?? '');
  const [durationMin, setDurationMin] = useState(initial.min);
  const [durationSec, setDurationSec] = useState(initial.sec);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    setHasPanel(true);
    return () => setHasPanel(false);
  }, [setHasPanel]);

  // Alimenta a barra do topo global com o contexto da aula (breadcrumb + status);
  // limpa ao sair da aula para a barra voltar ao modo padrão.
  const setActiveLesson = ctx?.setActiveLesson;
  const slug = ctx?.slug;
  useEffect(() => {
    if (!setActiveLesson) return;
    setActiveLesson({
      sectionLabel,
      title,
      visibility: lesson.visibility === 'visible' ? 'visible' : 'draft',
      previewHref: slug ? `/course/${slug}/lesson/${lesson.id}` : null,
    });
    return () => setActiveLesson(null);
  }, [setActiveLesson, slug, sectionLabel, title, lesson.visibility, lesson.id]);

  useEffect(() => {
    isInitialMount.current = true;
    const d = secondsToMinSec(lesson.duration);
    setTitle(lesson.title);
    setYoutubeUrl(lesson.youtubeUrl ?? '');
    setDescription(lesson.description ?? '');
    setDurationMin(d.min);
    setDurationSec(d.sec);
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
    setDurationMin(Math.max(0, parseInt(e.target.value, 10) || 0));
  }

  function handleDurationSecChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDurationSec(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)));
  }

  const sidePanel = (
    <LessonSidePanel
      lesson={lesson}
      youtubeUrl={youtubeUrl}
      onYoutubeUrlChange={setYoutubeUrl}
      durationMin={durationMin}
      durationSec={durationSec}
      onDurationMinChange={handleDurationMinChange}
      onDurationSecChange={handleDurationSecChange}
      onVideoInfo={handleVideoInfo}
      onDeleted={onDeleted}
      onUpdated={onUpdated}
    />
  );

  const durationStr = formatDuration(durationMin, durationSec);

  return (
    <EditorOuter>
      {/* A barra de contexto da aula foi fundida na barra global do curso (CourseTopBar). */}
      <ScrollArea>
        <TitleInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da aula"
        />
        {(sectionLabel || durationStr) && (
          <Subtitle>
            {[sectionLabel, durationStr].filter(Boolean).join(' · ')}
          </Subtitle>
        )}

        <DescLabel>Descrição</DescLabel>
        <Textarea
          id="lesson-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o conteúdo desta aula..."
        />
      </ScrollArea>

      {propertiesTarget && createPortal(sidePanel, propertiesTarget)}
    </EditorOuter>
  );
}

export function LessonEditorEmpty() {
  return (
    <EmptyState>Selecione uma aula no currículo para editá-la.</EmptyState>
  );
}
