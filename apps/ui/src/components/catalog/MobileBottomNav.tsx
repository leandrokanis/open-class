"use client";

import styled from "styled-components";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 50;
  padding-bottom: env(safe-area-inset-bottom, 0);

  @media (min-width: 768px) {
    display: none;
  }
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  flex: 1;
  padding: 8px 0;
`;

const NavLabel = styled.span<{ $active: boolean }>`
  font-size: 10px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text-secondary)")};
`;

const IconWrapper = styled.div<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text-secondary)")};
  display: flex;
`;

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Início", icon: HomeIcon },
  { href: "/aprendizado", label: "Aprendizado", icon: BookIcon },
  { href: "/buscar", label: "Buscar", icon: SearchIcon },
  { href: "/perfil", label: "Perfil", icon: UserIcon },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <Nav>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <NavItem key={href} href={href} $active={active}>
            <IconWrapper $active={active}>
              <Icon />
            </IconWrapper>
            <NavLabel $active={active}>{label}</NavLabel>
          </NavItem>
        );
      })}
    </Nav>
  );
}
