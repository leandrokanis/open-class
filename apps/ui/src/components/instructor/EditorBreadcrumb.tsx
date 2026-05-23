'use client';

import styled, { keyframes } from 'styled-components';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 44px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-secondary);
  flex-shrink: 0;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const BreadcrumbPart = styled.span<{ $dim?: boolean }>`
  font-size: 12px;
  color: ${({ $dim }) => ($dim ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
`;

const Sep = styled.span`
  color: var(--color-text-tertiary);
  font-size: 12px;
  flex-shrink: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

const VisibilityPill = styled.span<{ $visible: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 20px;
  color: ${({ $visible }) => ($visible ? 'var(--color-primary)' : 'var(--color-text-tertiary)')};
  background: ${({ $visible }) => ($visible ? 'var(--color-primary-light)' : 'var(--color-surface-tertiary)')};
  border: 1px solid ${({ $visible }) => ($visible ? 'rgba(232,160,69,0.3)' : 'var(--color-border)')};
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const SavedLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-tertiary);
  animation: ${fadeIn} 0.2s ease;
`;

interface EditorBreadcrumbProps {
  sectionLabel: string;
  lessonTitle: string;
  savedAt: Date | null;
  previewHref: string | null;
  visibility?: 'visible' | 'draft';
}

export function EditorBreadcrumb({
  sectionLabel,
  lessonTitle,
  savedAt,
  previewHref,
  visibility = 'draft',
}: EditorBreadcrumbProps) {
  const savedTime = savedAt
    ? savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <Bar>
      <Breadcrumb>
        <BreadcrumbPart $dim>{sectionLabel}</BreadcrumbPart>
        <Sep>/</Sep>
        <BreadcrumbPart>{lessonTitle || 'Sem título'}</BreadcrumbPart>
      </Breadcrumb>

      <Actions>
        <VisibilityPill $visible={visibility === 'visible'}>
          <Icon name={visibility === 'visible' ? 'visibility' : 'draft'} size={11} />
          {visibility === 'visible' ? 'Publicada' : 'Rascunho'}
        </VisibilityPill>

        {savedTime && (
          <SavedLabel key={savedTime}>
            <Icon name="check_circle" size={12} style={{ color: 'var(--color-success)' }} />
            Salvo {savedTime}
          </SavedLabel>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => previewHref && window.open(previewHref, '_blank')}
          disabled={!previewHref}
        >
          <Icon name="open_in_new" size={13} />
          Preview
        </Button>
      </Actions>
    </Bar>
  );
}
