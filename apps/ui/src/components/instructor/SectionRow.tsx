'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { deleteModule, updateModule, setModuleVisibility, fetchExtraUnlocks } from '@/lib/instructor';
import type { ModuleWithLessons } from '@/lib/instructor';
import LessonRow from './LessonRow';

const DBLCLICK_DELAY = 220;

const ExtrasHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px 2px 26px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-primary);
`;

const ExtrasUnlockBadge = styled.span`
  font-size: 10px;
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;
  color: var(--color-text-tertiary);
  margin-left: auto;
`;

const Wrapper = styled.div<{ $dragging?: boolean }>`
  display: flex;
  flex-direction: column;
  opacity: ${({ $dragging }) => ($dragging ? 0.35 : 1)};
`;

const Header = styled.div<{ $dragOver?: boolean }>`
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  cursor: pointer;
  user-select: none;
  height: 26px;
  position: relative;
  background: ${({ $dragOver }) => ($dragOver ? 'var(--color-primary-light)' : 'transparent')};
  outline: ${({ $dragOver }) => ($dragOver ? '1px solid var(--color-primary)' : 'none')};
  outline-offset: -1px;

  &:hover {
    background: ${({ $dragOver }) => ($dragOver ? 'var(--color-primary-light)' : 'var(--color-surface-tertiary)')};
  }

  &:hover .menu-btn {
    opacity: 1;
  }

  &:active {
    cursor: grabbing;
  }
`;

const Chevron = styled.span<{ $open: boolean }>`
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  transition: transform 0.12s;
  transform: rotate(${({ $open }) => ($open ? '90deg' : '0deg')});
`;

const FolderIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  margin-right: 3px;
`;

const TitleText = styled.span<{ $draft: boolean }>`
  font-size: 13px;
  font-weight: 500;
  color: ${({ $draft }) => ($draft ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)')};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  min-width: 140px;
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

const TreeChildren = styled.div`
  margin-left: 15px;
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
`;

const AddLessonBtn = styled(Button)`
  padding: 2px 4px;
  height: auto;
  color: var(--color-text-secondary);
  border-radius: 4px;

  &&:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-raised);
  }
`;

const InlineInput = styled(Input)`
  flex: 1;
  min-width: 0;
  height: 20px;
  padding: 0 6px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
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

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

interface MenuPos { x: number; y: number }

interface SectionRowProps {
  courseId: string;
  section: ModuleWithLessons;
  selectedLessonId: string | null;
  onSelectLesson: (id: string) => void;
  onAddLesson: (moduleId: string) => void;
  onDeleted: (moduleId: string) => void;
  onRenamed: (moduleId: string, title: string) => void;
  onLessonRenamed: (lessonId: string, title: string) => void;
  onLessonDeleted?: (lessonId: string) => void;
  onLessonVisibilityChange?: (lessonId: string, visibility: 'visible' | 'hidden') => void;
  onLessonAutoEditDone?: () => void;
  autoEditLessonId?: string | null;
  dragOver?: boolean;
  autoEdit?: boolean;
}

export default function SectionRow({
  courseId,
  section,
  selectedLessonId,
  onSelectLesson,
  onAddLesson,
  onDeleted,
  onRenamed,
  onLessonRenamed,
  onLessonDeleted,
  onLessonVisibilityChange,
  onLessonAutoEditDone,
  autoEditLessonId,
  dragOver,
  autoEdit,
}: SectionRowProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, data: { kind: 'section' } });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(section.title);
  const [visibility, setVisibility] = useState(section.visibility);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNew = useRef(!!autoEdit);

  useEffect(() => {
    if (autoEdit) {
      setDraftTitle(section.title);
      setEditing(true);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!dragOver || open) return;
    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
  }, [dragOver, open]);

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

  function openMenu(x: number, y: number) {
    setMenuPos({ x, y });
  }

  function handleMenuBtnClick(e: React.MouseEvent) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    openMenu(rect.left, rect.bottom + 4);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    openMenu(e.clientX, e.clientY);
  }

  function handleClick() {
    if (editing) return;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      setOpen((o) => !o);
    }, DBLCLICK_DELAY);
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    closeMenu();
    setDraftTitle(section.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  async function cancelCreate() {
    setEditing(false);
    await deleteModule(courseId, section.id);
    onDeleted(section.id);
  }

  async function commitRename() {
    setEditing(false);
    isNew.current = false;
    const trimmed = draftTitle.trim();
    if (!trimmed || trimmed === section.title) return;
    await updateModule(courseId, section.id, { title: trimmed });
    onRenamed(section.id, trimmed);
  }

  function handleMenuRename() {
    closeMenu();
    setDraftTitle(section.title);
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
    const ok = await setModuleVisibility(courseId, section.id, next);
    if (ok) setVisibility(next);
    setTogglingVisibility(false);
    setVisibilityOpen(false);
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    const ok = await deleteModule(courseId, section.id);
    if (ok) onDeleted(section.id);
    setDeleting(false);
    setDeleteOpen(false);
  }

  const normalLessons = (section.lessons ?? []).filter((l) => !l.isExtra);
  const extraLessons = (section.lessons ?? []).filter((l) => l.isExtra);
  const normalIds = normalLessons.map((l) => l.id);
  const extraIds = extraLessons.map((l) => l.id);

  const [unlockCount, setUnlockCount] = useState<number | null>(null);
  useEffect(() => {
    if (!open || extraLessons.length === 0) return;
    let cancelled = false;
    fetchExtraUnlocks(section.id).then((n) => {
      if (!cancelled) setUnlockCount(n);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, extraLessons.length, section.id]);

  return (
    <Wrapper ref={setNodeRef} style={sortableStyle} $dragging={isDragging}>
      <Header
        $dragOver={dragOver}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        title="Arrastar para reordenar"
        {...attributes}
        {...listeners}
      >
        <Chevron $open={open}>
          <Icon name="chevron_right" size={14} />
        </Chevron>
        <FolderIcon>
          <Icon name={open ? 'folder_open' : 'folder'} size={16} />
        </FolderIcon>

        {editing ? (
          <InlineInput
            ref={inputRef}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') {
                if (isNew.current) cancelCreate(); else setEditing(false);
              }
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        ) : (
          <>
            <TitleText $draft={visibility === 'hidden'}>
              {section.title}
            </TitleText>
            {visibility === 'hidden' && (
              <DraftTag title="Rascunho">
                <Icon name="edit_document" size={11} />
                Rascunho
              </DraftTag>
            )}
          </>
        )}

        <MenuBtn
          className="menu-btn"
          size="sm"
          variant="ghost"
          onClick={handleMenuBtnClick}
          title="Opções"
        >
          <Icon name="more_vert" size={14} />
        </MenuBtn>
        <AddLessonBtn
          className="menu-btn"
          size="sm"
          variant="ghost"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAddLesson(section.id); }}
          title="Adicionar aula"
        >
          <Icon name="add" size={14} />
        </AddLessonBtn>
      </Header>

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
              {visibility === 'visible' ? 'Mover para rascunho' : 'Publicar seção'}
            </MenuItem>
            <MenuDivider />
            <MenuItemDanger onClick={() => { closeMenu(); setDeleteOpen(true); }}>
              <Icon name="delete" size={13} />
              Excluir seção
            </MenuItemDanger>
          </ContextMenu>
        </ContextMenuWrap>,
        document.body,
      )}

      <Dialog
        open={deleteOpen}
        onOpenChange={(o) => { if (!deleting) setDeleteOpen(o); }}
        title="Excluir seção"
        description={`"${section.title}" e todas as suas aulas serão removidas permanentemente.`}
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

      <Dialog
        open={visibilityOpen}
        onOpenChange={(o) => { if (!togglingVisibility) setVisibilityOpen(o); }}
        title={visibility === 'visible' ? 'Mover para rascunho' : 'Publicar seção'}
        description={
          visibility === 'visible'
            ? `"${section.title}" ficará oculta para os alunos até ser publicada novamente.`
            : `"${section.title}" ficará visível para todos os alunos matriculados.`
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

      {open && (
        <TreeChildren>
          <SortableContext items={normalIds} strategy={verticalListSortingStrategy}>
            {normalLessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                selected={lesson.id === selectedLessonId}
                onClick={() => onSelectLesson(lesson.id)}
                onRenamed={onLessonRenamed}
                onDeleted={onLessonDeleted}
                onVisibilityChange={onLessonVisibilityChange}
                onAutoEditDone={onLessonAutoEditDone}
                autoEdit={lesson.id === autoEditLessonId}
                sectionDraft={visibility === 'hidden'}
                sectionId={section.id}
              />
            ))}
          </SortableContext>

          {extraLessons.length > 0 && (
            <>
              <ExtrasHeader>
                <Icon name="star" size={12} />
                Aulas extras
                {unlockCount !== null && (
                  <ExtrasUnlockBadge title="Alunos que já desbloquearam as aulas extras deste módulo">
                    {unlockCount} {unlockCount === 1 ? 'aluno desbloqueou' : 'alunos desbloquearam'}
                  </ExtrasUnlockBadge>
                )}
              </ExtrasHeader>
              <SortableContext items={extraIds} strategy={verticalListSortingStrategy}>
                {extraLessons.map((lesson) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    selected={lesson.id === selectedLessonId}
                    onClick={() => onSelectLesson(lesson.id)}
                    onRenamed={onLessonRenamed}
                    onDeleted={onLessonDeleted}
                    onVisibilityChange={onLessonVisibilityChange}
                    onAutoEditDone={onLessonAutoEditDone}
                    autoEdit={lesson.id === autoEditLessonId}
                    sectionDraft={visibility === 'hidden'}
                    sectionId={section.id}
                  />
                ))}
              </SortableContext>
            </>
          )}
        </TreeChildren>
      )}
    </Wrapper>
  );
}
