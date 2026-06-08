"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styled from "styled-components";
import { logout } from "@/lib/auth";
import { useUser } from "@/hooks/useUser";

const Wrapper = styled.div`
  position: relative;
`;

const AvatarButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient-avatar, var(--color-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
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

const Dropdown = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? "flex" : "none")};
  flex-direction: column;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
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
  font-family: inherit;

  &:hover {
    background: var(--color-surface-secondary);
  }
`;

const DropdownLogout = styled(DropdownItem)`
  color: var(--color-error, #dc2626);
  border-top: 1px solid var(--color-border);
`;

export function UserAvatarMenu() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, clear } = useUser();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    clear();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (!user) return null;

  return (
    <Wrapper ref={wrapperRef}>
      <AvatarButton
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu do usuário"
        aria-expanded={open}
      >
        {user.avatarUrl ? (
          <AvatarImg src={user.avatarUrl} alt={user.name} width={32} height={32} />
        ) : (
          user.name.charAt(0).toUpperCase()
        )}
      </AvatarButton>
      <Dropdown $open={open}>
        <DropdownItem onClick={() => { setOpen(false); router.push("/profile"); }}>
          Meu perfil
        </DropdownItem>
        <DropdownLogout onClick={handleLogout}>Sair</DropdownLogout>
      </Dropdown>
    </Wrapper>
  );
}
