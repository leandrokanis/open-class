'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose } from '@/components/ui/dialog';
import { updateLesson, setLessonVisibility, deleteLesson } from '@/lib/instructor';
import type { LessonData } from '@/lib/instructor';

const DBLCLICK_DELAY = 220;

const Row = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 13px;
  cursor: pointer;
  height: 26px;
  background: ${({ $selected }) => ($selected ? 'var(--color-primary-light)' : 'transparent')};
  user-select: none;
  position: relative;

  &:hover {
    background: ${({ $selected }) => ($selected ? 'var(--color-primary-light)' : 'var(--color-surface-tertiary)')};
  }

  &:hover .lesson-menu-btn {
    opacity: 1;
  }

  &:active {
    cursor: grabbing;
  }
`;

const TypeIcon = styled.span<{ $selected: boolean; $dimmed: boolean }>`
  display: inline-flex;
  flex-shrink: 0;
  color: ${({ $selected, $dimmed }) =>
    $selected ? 'var(--color-primary)' : $dimmed ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)'};
`;

const Title = styled.span<{ $selected: boolean; $dimmed: boolean }>`
  font-size: 13px;
  color: ${({ $selected, $dimmed }) =>
    $selected ? 'var(--color-primary)' : $dimmed ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)'};
  font-weight: ${({ $selected }) => ($selected ? '500' : '400')};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const Duration = styled.span`
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
`;

const DraftTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  letter-spacing: 0.02em;
`;

const ExtraTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  border-radius: 10px;
  padding: 1px 7px;
  flex-shrink: 0;
  letter-spacing: 0.02em;
`;

const InlineInput = styled(Input)`
  flex: 1;
  min-width: 0;
  height: 20px;
  padding: 0 6px;
  font-size: 13px;
  line-height: 1;
`;

const MenuBtn = styled(Button)`
  opacity: 0;
  transition: opacity 0.12s;
  flex-shrink: 0;
  padding: 2px 4px;
  height: auto;
  color: var(--color-text-secondary);
  border-radius: 4px;

  &&:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-raised);
  }
`;

const ContextMenuWrap = styled.div`
  position: fixed;
  z-index: 500;
`;

const ContextMenu = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  padding: 3px;
  min-width: 160px;
  display: flex;
  flex-direction: column;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--color-text-primary);
  font-family: inherit;
  border-radius: 4px;
  text-align: left;
  width: 100%;
  transition: background 0.1s;

  &:hover {
    background: var(--color-surface-tertiary);
  }
`;

const MenuItemDanger = styled(MenuItem)`
  color: var(--color-destructive);
`;

const MenuDivider = styled.div`
  height: 1px;
  background: var(--color-border);
  margin: 2px 0;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

interface MenuPos { x: number; y: number }

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function lessonIcon(contentType: string): string {
  switch (contentType) {
    case 'video': return 'videocam';
    case 'text':  return 'article';
    case 'quiz':  return 'quiz';
    case 'file':  return 'attach_file';
    default:      return 'play_circle';
  }
}

interface LessonRowProps {
  lesson: LessonData;
  selected: boolean;
  onClick: () => void;
  onRenamed: (lessonId: string, title: string) => void;
  onDeleted?: (lessonId: string) => void;
  onVisibilityChange?: (lessonId: string, visibility: 'visible' | 'hidden') => void;
  onAutoEditDone?: () => void;
  autoEdit?: boolean;
  sectionDraft?: boolean;
  sectionId?: string;
}

export default function LessonRow({ lesson, selected, onClick, onRenamed, onDeleted, onVisibilityChange, onAutoEditDone, autoEdit, sectionDraft, sectionId }: LessonRowProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id, data: { kind: 'lesson', sectionId } });
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(lesson.title);
  const [visibility, setVisibility] = useState(lesson.visibility);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duration = formatDuration(lesson.duration);

  useEffect(() => {
    if (autoEdit) {
      setDraftTitle(lesson.title);
      setEditing(true);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dimmed = sectionDraft || visibility === 'hidden';

  const closeMenu = useCallback(() => setMenuPos(null), []);

  useEffect(() => {
    if (!menuPos) return;
    function onDown(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-context-menu]')) closeMenu();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu();
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuPos, closeMenu]);

  function handleMenuBtnClick(e: React.MouseEvent) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom + 4 });
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
  }

  function handleClick() {
    if (editing) return;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      onClick();
    }, DBLCLICK_DELAY);
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    closeMenu();
    setDraftTitle(lesson.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  async function commitRename() {
    setEditing(false);
    onAutoEditDone?.();
    const trimmed = draftTitle.trim();
    if (!trimmed || trimmed === lesson.title) return;
    await updateLesson(lesson.id, { title: trimmed });
    onRenamed(lesson.id, trimmed);
  }

  function handleMenuRename() {
    closeMenu();
    setDraftTitle(lesson.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function handleMenuVisibility() {
    closeMenu();
    setVisibilityOpen(true);
  }

  async function handleConfirmVisibility() {
    setTogglingVisibility(true);
    const next: 'visible' | 'hidden' = visibility === 'visible' ? 'hidden' : 'visible';
    const ok = await setLessonVisibility(lesson.id, next);
    if (ok) {
      setVisibility(next);
      onVisibilityChange?.(lesson.id, next);
    }
    setTogglingVisibility(false);
    setVisibilityOpen(false);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    const ok = await deleteLesson(lesson.id);
    if (ok) onDeleted?.(lesson.id);
    setDeleting(false);
    setDeleteOpen(false);
  }

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <>
      <Row
        ref={setNodeRef}
        style={sortableStyle}
        $selected={selected}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        title="Arrastar para reordenar"
        {...attributes}
        {...listeners}
      >
        <TypeIcon $selected={selected} $dimmed={dimmed}>
          <Icon name={lessonIcon(lesson.contentType)} size={15} />
        </TypeIcon>
        {editing ? (
          <InlineInput
            ref={inputRef}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setEditing(false);
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        ) : (
          <>
            <Title $selected={selected} $dimmed={dimmed}>
              {lesson.title}
            </Title>
            <Meta>
              {lesson.cohortId && (
                <ExtraTag title="Aula exclusiva de turma — não aparece no on demand nem em outras turmas">
                  <Icon name="groups" size={11} />
                  Turma
                </ExtraTag>
              )}
              {lesson.isExtra && (
                <ExtraTag title="Aula extra — desbloqueada ao concluir as aulas normais do módulo">
                  <Icon name="star" size={11} />
                  Extra
                </ExtraTag>
              )}
              {visibility === 'hidden' && (
                <DraftTag title="Rascunho">
                  <Icon name="edit_document" size={11} />
                  Rascunho
                </DraftTag>
              )}
              {duration && <Duration>{duration}</Duration>}
              <MenuBtn
                className="lesson-menu-btn"
                size="sm"
                variant="ghost"
                onClick={handleMenuBtnClick}
                title="Opções"
              >
                <Icon name="more_vert" size={13} />
              </MenuBtn>
            </Meta>
          </>
        )}
      </Row>

      {menuPos && createPortal(
        <ContextMenuWrap
          data-theme="dark"
          data-context-menu
          style={{ top: menuPos.y, left: menuPos.x }}
        >
          <ContextMenu>
            <MenuItem onClick={handleMenuRename}>
              <Icon name="edit" size={13} />
              Renomear
            </MenuItem>
            <MenuItem onClick={handleMenuVisibility}>
              <Icon name={visibility === 'visible' ? 'visibility_off' : 'publish'} size={13} />
              {visibility === 'visible' ? 'Mover para rascunho' : 'Publicar aula'}
            </MenuItem>
            <MenuDivider />
            <MenuItemDanger onClick={() => { closeMenu(); setDeleteOpen(true); }}>
              <Icon name="delete" size={13} />
              Excluir aula
            </MenuItemDanger>
          </ContextMenu>
        </ContextMenuWrap>,
        document.body,
      )}

      <Dialog
        open={visibilityOpen}
        onOpenChange={(o) => { if (!togglingVisibility) setVisibilityOpen(o); }}
        title={visibility === 'visible' ? 'Mover para rascunho' : 'Publicar aula'}
        description={
          visibility === 'visible'
            ? `"${lesson.title}" ficará oculta para os alunos até ser publicada novamente.`
            : `"${lesson.title}" ficará visível para todos os alunos matriculados.`
        }
      >
        <ModalFooter>
          <DialogClose asChild>
            <Button size="sm" variant="outline" disabled={togglingVisibility}>Cancelar</Button>
          </DialogClose>
          <Button size="sm" variant="default" disabled={togglingVisibility} onClick={handleConfirmVisibility}>
            {togglingVisibility
              ? 'Salvando...'
              : visibility === 'visible' ? 'Mover para rascunho' : 'Publicar'}
          </Button>
        </ModalFooter>
      </Dialog>

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
    </>
  );
}
