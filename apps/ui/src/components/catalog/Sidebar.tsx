"use client";

import styled, { keyframes, css } from "styled-components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { usePlatformConfig } from "@/lib/platform-config/usePlatformConfig";
import { logout, type UserProfile } from "@/lib/auth";

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

const UserBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient-avatar);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LogoutBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 400;
  color: var(--color-error, #dc2626);
  width: 100%;
  text-align: left;
  transition: background 0.15s ease;

  &:hover {
    background: var(--color-surface-secondary);
  }
`;


function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function ChalkboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

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
  onLogout: () => void;
  user?: UserProfile | null;
}

export function Sidebar({ open, onClose, onLogout, user }: SidebarProps) {
  const pathname = usePathname();
  const config = usePlatformConfig();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    onLogout();
    onClose();
    router.push("/");
    router.refresh();
  }

  if (!open) return null;

  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <Panel $open={open}>
        <Header>
          <LogoText>{config.platformName}</LogoText>
          <CloseBtn onClick={onClose} aria-label="Fechar menu">
            <XIcon />
          </CloseBtn>
        </Header>

        {user && (
          <>
            <UserBlock>
              <UserAvatar>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.name} />
                  : user.name.charAt(0).toUpperCase()}
              </UserAvatar>
              <UserInfo>
                <UserName>{user.name}</UserName>
                <UserEmail>{user.email}</UserEmail>
              </UserInfo>
            </UserBlock>
            <LogoutBtn onClick={handleLogout}>Sair</LogoutBtn>
          </>
        )}

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
          {user && (user.role === "instrutor" || user.role === "admin") && (
            <NavLink
              href="/instructor"
              $active={pathname.startsWith("/instructor")}
              onClick={onClose}
            >
              <NavIcon><ChalkboardIcon /></NavIcon>
              Painel do instrutor
            </NavLink>
          )}
          {user && user.role === "admin" && (
            <NavLink
              href="/admin/configuracoes"
              $active={pathname.startsWith("/admin")}
              onClick={onClose}
            >
              <NavIcon><SettingsIcon /></NavIcon>
              Configurações da plataforma
            </NavLink>
          )}
        </Nav>

      </Panel>
    </>
  );
}
