'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { closeCohort, type CohortData } from '@/lib/instructor';
import { CohortFormModal } from './CohortFormModal';

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const Name = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
`;

const Badge = styled.span<{ $status: CohortData['status'] }>`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 10px;
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

const Meta = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const KebabMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  padding: 4px;
  z-index: 50;
  min-width: 160px;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;
  color: var(--color-destructive);
  border-radius: 6px;
  text-align: left;

  &:hover { background: var(--color-surface-tertiary); }
`;

const ModalFooter = styled.div`display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;`;

const STATUS_LABEL: Record<CohortData['status'], string> = {
  agendada: 'Agendada', aberta: 'Inscrições abertas', encerrada: 'Encerrada',
};

function formatPeriod(start: string, end: string): string {
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return `${fmt(start)} — ${fmt(end)}`;
}

interface CohortDetailHeaderProps {
  courseId: string;
  cohort: CohortData;
  onChanged: (cohort: CohortData) => void;
}

export function CohortDetailHeader({ courseId, cohort, onChanged }: CohortDetailHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closed = cohort.status === 'encerrada';

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  async function handleConfirmClose() {
    const result = await closeCohort(cohort.id);
    setCloseOpen(false);
    if (result) { onChanged(result); toast.success('Turma encerrada.'); }
    else toast.error('Erro ao encerrar a turma.');
  }

  return (
    <Header>
      <Info>
        <TitleRow>
          <Name>{cohort.name}</Name>
          <Badge $status={cohort.status}>{STATUS_LABEL[cohort.status]}</Badge>
        </TitleRow>
        <Meta>
          <span>Inscrições: {formatPeriod(cohort.enrollmentStart, cohort.enrollmentEnd)}</span>
          <span>{cohort.seats} vagas</span>
        </Meta>
      </Info>

      <Actions ref={menuRef}>
        <Button size="sm" variant="outline" disabled={closed} onClick={() => setEditOpen(true)}>
          <Icon name="edit" size={14} />
          Editar
        </Button>
        {!closed && (
          <Button size="sm" variant="ghost" onClick={() => setMenuOpen((o) => !o)} aria-label="Mais ações">
            <Icon name="more_vert" size={16} />
          </Button>
        )}
        {menuOpen && (
          <KebabMenu>
            <MenuItem onClick={() => { setMenuOpen(false); setCloseOpen(true); }}>
              <Icon name="lock" size={14} />
              Encerrar turma
            </MenuItem>
          </KebabMenu>
        )}
      </Actions>

      <CohortFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        courseId={courseId}
        cohort={cohort}
        onSaved={onChanged}
      />

      <Dialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title="Encerrar turma"
        description={`"${cohort.name}" não aceitará novas inscrições após o encerramento.`}
      >
        <ModalFooter>
          <DialogClose asChild>
            <Button size="sm" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button size="sm" variant="destructive" onClick={handleConfirmClose}>Encerrar turma</Button>
        </ModalFooter>
      </Dialog>
    </Header>
  );
}
