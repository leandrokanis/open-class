"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import styled from "styled-components";
import { logout } from "@/lib/auth";
import { useSidebarSlot } from "@/components/instructor/SidebarSlotContext";

const Sidebar = styled.aside<{ $width: number }>`
  width: ${({ $width }) => $width}px;
  min-width: ${({ $width }) => $width}px;
  height: 100vh;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  user-select: none;
`;

const ResizeHandle = styled.div`
  position: absolute;
  right: -3px;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: transparent;
    transition: background 0.15s;
  }

  &:hover::after {
    background: var(--color-primary);
  }
`;

const Nav = styled.nav`
  padding: 12px 8px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active }) => ($active ? "var(--color-primary)" : "var(--color-text-secondary)")};
  background: ${({ $active }) => ($active ? "rgba(232,160,69,0.12)" : "transparent")};
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: var(--color-surface-secondary);
    color: var(--color-primary);
  }
`;

const NavDivider = styled.div`
  height: 1px;
  background: var(--color-border);
  margin: 6px 8px;
`;

const PanelSlot = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`;

const Footer = styled.div`
  padding: 16px 12px;
  border-top: 1px solid var(--color-border);
  position: relative;
  flex-shrink: 0;
`;

const AvatarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 8px;
  transition: background 0.15s;

  &:hover {
    background: var(--color-surface-secondary);
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-on-primary);
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
`;

const UserInfo = styled.div`
  min-width: 0;
  flex: 1;
  text-align: left;
`;

const UserName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: 11px;
  color: var(--color-text-secondary);
`;

const Dropdown = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? "flex" : "none")};
  flex-direction: column;
  position: absolute;
  bottom: calc(100% + 6px);
  left: 12px;
  right: 12px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 200;
`;

const DropdownItem = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 11px 16px;
  font-size: 14px;
  color: var(--color-text-primary);
  text-align: left;
  width: 100%;
  font-family: inherit;
  transition: background 0.12s;

  &:hover {
    background: var(--color-surface-tertiary);
  }
`;

const DropdownLogout = styled(DropdownItem)`
  color: var(--color-destructive);
  border-top: 1px solid var(--color-border);
`;

interface InstructorSidebarProps {
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}

const MIN_WIDTH = 180;
const MAX_WIDTH = 480;

export function InstructorSidebar({ userName = "Instrutor", userRole = "Instrutor", avatarUrl, isAdmin = false }: InstructorSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const { registerTarget } = useSidebarSlot();

  const effectiveWidth = width ?? 260;

  function handleResizeMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = effectiveWidth;

    function onMouseMove(ev: MouseEvent) {
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + ev.clientX - startX));
      setWidth(next);
    }
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    }
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  const initial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (footerRef.current && !footerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <Sidebar $width={effectiveWidth} style={{ position: 'relative' }}>
      <ResizeHandle onMouseDown={handleResizeMouseDown} />

      <Nav>
        <NavLink href="/instructor" $active={pathname === "/instructor"}>
          Meus Cursos
        </NavLink>
        {isAdmin && (
          <NavLink href="/admin/configuracoes" $active={pathname.startsWith("/admin")}>
            Configurações da plataforma
          </NavLink>
        )}
        <NavDivider />
        <NavLink href="/" $active={false}>
          Voltar ao catálogo
        </NavLink>
      </Nav>

      <PanelSlot ref={registerTarget} />

      <Footer ref={footerRef}>
        <Dropdown $open={open}>
          <DropdownItem onClick={() => { setOpen(false); router.push("/perfil"); }}>
            Meu perfil
          </DropdownItem>
          <DropdownItem onClick={() => { setOpen(false); router.push("/aprendizado"); }}>
            Meu aprendizado
          </DropdownItem>
          <DropdownLogout onClick={handleLogout}>Sair</DropdownLogout>
        </Dropdown>
        <AvatarButton onClick={() => setOpen((v) => !v)} aria-label="Menu do usuário" aria-expanded={open}>
          <Avatar>
            {avatarUrl ? (
              <Image src={avatarUrl} alt={userName} fill sizes="32px" style={{ objectFit: "cover" }} />
            ) : (
              initial
            )}
          </Avatar>
          <UserInfo>
            <UserName>{userName}</UserName>
            <UserRole>{userRole}</UserRole>
          </UserInfo>
        </AvatarButton>
      </Footer>
    </Sidebar>
  );
}
