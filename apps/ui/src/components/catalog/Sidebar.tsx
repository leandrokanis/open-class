"use client";

import styled, { keyframes, css } from "styled-components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { ThemeContext } from "@/lib/theme/ThemeProvider";

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
`;

const slideOut = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-100%); }
`;

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: opacity 0.25s ease;
`;

const Panel = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  z-index: 101;
  display: flex;
  flex-direction: column;
  animation: ${({ $open }) =>
    $open
      ? css`${slideIn} 0.25s ease forwards`
      : css`${slideOut} 0.25s ease forwards`};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
`;

const LogoText = styled.span`
  font-size: 17px;
  font-weight: 700;
  color: var(--color-primary);
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background: var(--color-surface-secondary);
    color: var(--color-text-primary);
  }
`;

const Nav = styled.nav`
  flex: 1;
  padding: 12px 12px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text-primary)")};
  background: ${({ $active }) => ($active ? "var(--color-primary-light)" : "transparent")};
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--color-surface-secondary);
    color: var(--color-primary);
  }
`;

const NavIcon = styled.span`
  display: flex;
  width: 20px;
  flex-shrink: 0;
`;

const Footer = styled.div`
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
`;

const ThemeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ThemeLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
`;

const Toggle = styled.button<{ $dark: boolean }>`
  position: relative;
  width: 48px;
  height: 26px;
  border-radius: 13px;
  border: none;
  cursor: pointer;
  background: ${({ $dark }) => ($dark ? "var(--color-primary)" : "var(--color-border)")};
  transition: background 0.2s ease;
  flex-shrink: 0;

  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: ${({ $dark }) => ($dark ? "25px" : "3px")};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffffff;
    transition: left 0.2s ease;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }
`;

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Catálogo", icon: HomeIcon },
  { href: "/aprendizado", label: "Meu Aprendizado", icon: BookIcon },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const ctx = useContext(ThemeContext);

  if (!open) return null;

  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <Panel $open={open}>
        <Header>
          <LogoText>Open Class</LogoText>
          <CloseBtn onClick={onClose} aria-label="Fechar menu">
            <XIcon />
          </CloseBtn>
        </Header>

        <Nav>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              href={href}
              $active={pathname === href}
              onClick={onClose}
            >
              <NavIcon><Icon /></NavIcon>
              {label}
            </NavLink>
          ))}
        </Nav>

        <Footer>
          <ThemeRow>
            <ThemeLabel>
              {ctx?.theme === "dark" ? <MoonIcon /> : <SunIcon />}
              {ctx?.theme === "dark" ? "Tema escuro" : "Tema claro"}
            </ThemeLabel>
            <Toggle
              $dark={ctx?.theme === "dark"}
              onClick={ctx?.toggleTheme}
              aria-label="Alternar tema"
            />
          </ThemeRow>
        </Footer>
      </Panel>
    </>
  );
}
