"use client";

import styled from "styled-components";
import Link from "next/link";

const HeaderMobile = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: transparent;
  position: relative;
  z-index: 10;

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
    background: #ffffff;
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

const MenuIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 4px;

  span {
    display: block;
    width: 22px;
    height: 2px;
    background: #ffffff;
    border-radius: 2px;
  }

  @media (min-width: 768px) {
    span {
      background: var(--color-text-primary);
    }
  }
`;

const Avatar = styled.div`
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
      background: #fff;
    }

    &::placeholder {
      color: var(--color-text-tertiary);
    }
  }
`;

const HamburgerIcon = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
    <line x1="0" y1="1" x2="22" y2="1" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="0" y1="8" x2="22" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="0" y1="15" x2="22" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="1" y="1" width="7" height="7" rx="1" fill="currentColor" />
    <rect x="12" y="1" width="7" height="7" rx="1" fill="currentColor" />
    <rect x="1" y="12" width="7" height="7" rx="1" fill="currentColor" />
    <rect x="12" y="12" width="7" height="7" rx="1" fill="currentColor" />
  </svg>
);

export function AppHeader() {
  return (
    <>
      <HeaderMobile>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <HamburgerIcon />
        </button>
        <LogoText>Open Class</LogoText>
        <Avatar>B</Avatar>
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
        <Avatar>B</Avatar>
      </HeaderDesktop>
    </>
  );
}
