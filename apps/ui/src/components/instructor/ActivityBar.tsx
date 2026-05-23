'use client';

import styled from 'styled-components';
import { Icon } from '@/components/ui/Icon';
import { useActivity, type ActivitySection } from './ActivityContext';

const Bar = styled.aside`
  width: 48px;
  min-width: 48px;
  height: 100vh;
  background: var(--color-background);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  flex-shrink: 0;
  position: sticky;
  top: 0;
`;

const Logo = styled.div`
  width: 30px;
  height: 30px;
  background: var(--color-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 20px;
  color: var(--color-text-on-primary);
`;

const NavGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
`;

const NavIcon = styled.button<{ $active: boolean }>`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  background: ${({ $active }) => ($active ? 'rgba(232,160,69,0.15)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--color-text-tertiary)')};

  &:hover {
    background: ${({ $active }) => ($active ? 'rgba(232,160,69,0.15)' : 'var(--color-surface-tertiary)')};
    color: ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--color-text-secondary)')};
  }
`;

const AvatarCircle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-surface-tertiary);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  flex-shrink: 0;
`;

const navItems: { section: ActivitySection; icon: string; label: string }[] = [
  { section: 'curriculum', icon: 'school',    label: 'Currículo' },
  { section: 'students',   icon: 'group',     label: 'Alunos' },
  { section: 'revenue',    icon: 'payments',  label: 'Receitas' },
  { section: 'settings',   icon: 'settings',  label: 'Configurações' },
];

interface ActivityBarProps {
  userInitial?: string;
}

export function ActivityBar({ userInitial = '?' }: ActivityBarProps) {
  const { activeSection, setActiveSection } = useActivity();

  return (
    <Bar>
      <Logo>
        <Icon name="school" size={16} />
      </Logo>

      <NavGroup>
        {navItems.map(({ section, icon, label }) => (
          <NavIcon
            key={section}
            $active={activeSection === section}
            onClick={() => setActiveSection(section)}
            title={label}
            aria-label={label}
          >
            <Icon name={icon} size={18} />
          </NavIcon>
        ))}
      </NavGroup>

      <AvatarCircle>{userInitial}</AvatarCircle>
    </Bar>
  );
}
