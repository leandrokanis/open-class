"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styled from "styled-components";
import { logout } from "@/lib/auth";
import { Icon } from "@/components/ui/Icon";
import { useSidebarSlot } from "@/components/instructor/SidebarSlotContext";

const Sidebar = styled.aside<{ $wide: boolean }>`
  width: ${({ $wide }) => ($wide ? "260px" : "220px")};
  min-width: ${({ $wide }) => ($wide ? "260px" : "220px")};
  height: 100vh;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  transition: width 0.2s, min-width 0.2s;
`;

const Nav = styled.nav`
  padding: 24px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
`;

const PanelSlot = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  border-top: 1px solid var(--color-border);
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  color: ${({ $active }) => ($active ? "var(--color-text-primary)" : "var(--color-text-secondary)")};
  background: ${({ $active }) => ($active ? "var(--color-primary-light)" : "transparent")};

  &:hover {
    background: ${({ $active }) => ($active ? "var(--color-primary-light)" : "var(--color-surface-secondary)")};
    color: var(--color-text-primary);
  }
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

const navItems = [
  { href: "/instructor",                label: "Meus Cursos",   icon: "school",   matchPrefix: ["/instructor/cursos"] },
  { href: "/instructor/alunos",         label: "Alunos",        icon: "group",    matchPrefix: [] },
  { href: "/instructor/configuracoes",  label: "Configurações", icon: "settings", matchPrefix: [] },
];

interface InstructorSidebarProps {
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
}

export function InstructorSidebar({ userName = "Instrutor", userRole = "Instrutor", avatarUrl }: InstructorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const { registerTarget, hasPanel } = useSidebarSlot();

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

  function isActive(item: typeof navItems[number]) {
    if (item.href === "/instructor") {
      return pathname === "/instructor" || item.matchPrefix.some((p) => pathname.startsWith(p));
    }
    return pathname.startsWith(item.href);
  }

  return (
    <Sidebar $wide={hasPanel}>
      <Nav>
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} $active={isActive(item)}>
            <Icon name={item.icon} size={18} />
            {item.label}
          </NavLink>
        ))}
      </Nav>

      <PanelSlot ref={registerTarget} />

      <Footer ref={footerRef}>
        <Dropdown $open={open}>
          <DropdownItem onClick={() => { setOpen(false); router.push("/perfil"); }}>
            Meu perfil
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
