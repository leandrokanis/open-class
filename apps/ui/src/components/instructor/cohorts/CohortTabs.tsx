'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Icon } from '@/components/ui/Icon';
import { CohortProgressTab } from './CohortProgressTab';
import { CohortScheduleTab } from './CohortScheduleTab';
import { CohortExclusivesTab } from './CohortExclusivesTab';

type TabKey = 'progresso' | 'cronograma' | 'exclusivas';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'progresso', label: 'Progresso', icon: 'monitoring' },
  { key: 'cronograma', label: 'Cronograma', icon: 'calendar_month' },
  { key: 'exclusivas', label: 'Exclusivas', icon: 'star' },
];

const TabBar = styled.div`
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
  margin: 20px 0 24px;
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  color: ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--color-text-secondary)')};
  border-bottom: 2px solid ${({ $active }) => ($active ? 'var(--color-primary)' : 'transparent')};
  margin-bottom: -1px;
  transition: color 0.12s;

  &:hover { color: var(--color-text-primary); }
`;

interface CohortTabsProps {
  cohortId: string;
  readOnly?: boolean;
}

// Lê o tab inicial da URL no cliente (evita useSearchParams e o Suspense no build).
function initialTab(): TabKey {
  if (typeof window === 'undefined') return 'progresso';
  const t = new URLSearchParams(window.location.search).get('tab') as TabKey | null;
  return t && TABS.some((tab) => tab.key === t) ? t : 'progresso';
}

export function CohortTabs({ cohortId, readOnly = false }: CohortTabsProps) {
  const [active, setActive] = useState<TabKey>(initialTab);

  function selectTab(key: TabKey) {
    setActive(key);
    // Deep-link sem re-render de navegação: atualiza a query string no lugar.
    const url = new URL(window.location.href);
    url.searchParams.set('tab', key);
    window.history.replaceState(null, '', url.toString());
  }

  return (
    <div>
      <TabBar>
        {TABS.map((t) => (
          <Tab key={t.key} $active={active === t.key} onClick={() => selectTab(t.key)}>
            <Icon name={t.icon} size={15} />
            {t.label}
          </Tab>
        ))}
      </TabBar>

      {active === 'progresso' && <CohortProgressTab cohortId={cohortId} />}
      {active === 'cronograma' && <CohortScheduleTab cohortId={cohortId} readOnly={readOnly} />}
      {active === 'exclusivas' && <CohortExclusivesTab cohortId={cohortId} readOnly={readOnly} />}
    </div>
  );
}
