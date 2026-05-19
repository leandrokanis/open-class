"use client";

import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { useState, useContext, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeContext } from "@/lib/theme/ThemeProvider";
import { logout } from "@/lib/auth";
import { useUser } from "@/hooks/useUser";
import { Sidebar } from "./Sidebar";

const HeaderMobile = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--gradient-hero);
  position: sticky;
  top: 0;
  z-index: 50;

  @media (min-width: 768px) {
    display: none;
  }
`;

const HeaderDesktop = styled.header`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    padding: 0 32px;
    height: 60px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 50;
    gap: 0;
  }
`;

const LogoText = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  font-family: var(--font-inter), system-ui, sans-serif;

  @media (min-width: 768px) {
    color: var(--color-primary);
    font-size: 16px;
  }
`;

const LogoDesktop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 32px;
`;

const AvatarButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gradient-avatar);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  flex-shrink: 0;
  border: none;
  padding: 0;
  overflow: hidden;
`;

const AvatarImg = styled(Image)`
  object-fit: cover;
  border-radius: 50%;
`;

const EntrarLink = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-decoration: none;
  padding: 6px 14px;
  border: 1.5px solid rgba(255,255,255,0.6);
  border-radius: 8px;

  @media (min-width: 768px) {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  &:hover {
    background: rgba(255,255,255,0.1);

    @media (min-width: 768px) {
      background: var(--color-primary-light);
    }
  }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text-secondary)")};
  text-decoration: none;
  padding: 4px 12px;
  border-bottom: ${({ $active }) => ($active ? "2px solid var(--color-primary)" : "2px solid transparent")};
  line-height: 60px;

  &:hover {
    color: var(--color-primary);
  }
`;

const DesktopSearch = styled.div`
  flex: 1;
  max-width: 320px;
  margin-right: 16px;

  input {
    width: 100%;
    padding: 8px 14px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-input);
    font-size: 14px;
    color: var(--color-text-primary);
    background: var(--color-surface-secondary);
    outline: none;

    &:focus {
      border-color: var(--color-primary);
      background: var(--color-surface);
    }

    &::placeholder {
      color: var(--color-text-tertiary);
    }
  }
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  color: var(--color-text-secondary);

  &:hover {
    background: var(--color-surface-secondary);
    color: var(--color-text-primary);
  }
`;

const ThemeToggle = styled.button<{ $dark: boolean }>`
  position: relative;
  width: 40px;
  height: 22px;
  border-radius: 11px;
  border: none;
  cursor: pointer;
  background: ${({ $dark }) => ($dark ? "var(--color-primary)" : "var(--color-border)")};
  transition: background 0.2s ease;
  flex-shrink: 0;
  margin-right: 16px;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${({ $dark }) => ($dark ? "20px" : "2px")};
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ffffff;
    transition: left 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const Dropdown = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? "flex" : "none")};
  flex-direction: column;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  min-width: 160px;
  overflow: hidden;
  z-index: 200;
`;

const DropdownItem = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text-primary);
  text-align: left;
  width: 100%;

  &:hover {
    background: var(--color-surface-secondary);
  }
`;

const DropdownLogout = styled(DropdownItem)`
  color: var(--color-error, #dc2626);
  border-top: 1px solid var(--color-border);
`;

function HamburgerIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <line x1="0" y1="1" x2="22" y2="1" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="0" y1="8" x2="22" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="0" y1="15" x2="22" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="12" y="1" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="1" y="12" width="7" height="7" rx="1" fill="currentColor" />
      <rect x="12" y="12" width="7" height="7" rx="1" fill="currentColor" />
    </svg>
  );
}

function AvatarContent({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return <AvatarImg src={avatarUrl} alt={name} width={36} height={36} />;
  }
  return <>{name.charAt(0).toUpperCase()}</>;
}

export function AppHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ctx = useContext(ThemeContext);
  const { user } = useUser();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <HeaderMobile>
        <IconBtn onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
          <HamburgerIcon />
        </IconBtn>
        <LogoText>Open Class</LogoText>
        {user ? (
          <AvatarButton onClick={() => setSidebarOpen(true)} aria-label="Abrir menu do usuário">
            <AvatarContent name={user.name} avatarUrl={user.avatarUrl} />
          </AvatarButton>
        ) : (
          <EntrarLink href="/login">Entrar</EntrarLink>
        )}
      </HeaderMobile>

      <HeaderDesktop>
        <LogoDesktop>
          <div style={{ color: "var(--color-primary)", display: "flex" }}>
            <GridIcon />
          </div>
          <LogoText>Open Class</LogoText>
        </LogoDesktop>
        <NavLinks>
          <NavLink href="/" $active>Catálogo</NavLink>
          <NavLink href="/aprendizado">Meu Aprendizado</NavLink>
        </NavLinks>
        <DesktopSearch>
          <input placeholder="Buscar cursos..." />
        </DesktopSearch>
        <ThemeToggle
          $dark={ctx?.theme === "dark"}
          onClick={ctx?.toggleTheme}
          aria-label="Alternar tema"
        />
        {user ? (
          <AvatarWrapper ref={dropdownRef}>
            <AvatarButton
              onClick={() => setDropdownOpen((v) => !v)}
              aria-label="Menu do usuário"
              aria-expanded={dropdownOpen}
            >
              <AvatarContent name={user.name} avatarUrl={user.avatarUrl} />
            </AvatarButton>
            <Dropdown $open={dropdownOpen}>
              <DropdownItem onClick={() => { setDropdownOpen(false); router.push("/perfil"); }}>
                Meu perfil
              </DropdownItem>
              <DropdownLogout onClick={handleLogout}>Sair</DropdownLogout>
            </Dropdown>
          </AvatarWrapper>
        ) : (
          <EntrarLink href="/login">Entrar</EntrarLink>
        )}
      </HeaderDesktop>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
    </>
  );
}
