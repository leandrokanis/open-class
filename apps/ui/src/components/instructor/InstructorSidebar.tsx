"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";

const Sidebar = styled.aside`
  width: 210px;
  min-width: 210px;
  height: 100vh;
  background: #1a1f2e;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
`;

const Brand = styled.div`
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
`;

const BrandName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
`;

const BrandSub = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  margin-left: 42px;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
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
  transition: background 0.15s;
  color: ${({ $active }) => ($active ? "#ffffff" : "rgba(255,255,255,0.6)")};
  background: ${({ $active }) => ($active ? "rgba(59,130,246,0.25)" : "transparent")};

  &:hover {
    background: ${({ $active }) => ($active ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.07)")};
    color: #ffffff;
  }
`;

const NavIcon = styled.span`
  font-size: 16px;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
`;

const Footer = styled.div`
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
`;

const navItems = [
  { href: "/instructor", label: "Visão Geral", icon: "⊞" },
  { href: "/instructor", label: "Meus Cursos", icon: "📚" },
  { href: "/instructor/alunos", label: "Alunos", icon: "👥" },
  { href: "/instructor/receitas", label: "Receitas", icon: "$" },
  { href: "/instructor/configuracoes", label: "Configurações", icon: "⚙" },
];

interface InstructorSidebarProps {
  userName?: string;
  userRole?: string;
}

export function InstructorSidebar({ userName = "Instrutor", userRole = "Instrutora" }: InstructorSidebarProps) {
  const pathname = usePathname();

  const initial = userName.charAt(0).toUpperCase();

  return (
    <Sidebar>
      <Brand>
        <BrandLogo>
          <LogoIcon>OC</LogoIcon>
          <BrandName>Open Class</BrandName>
        </BrandLogo>
        <BrandSub>Painel do Instrutor</BrandSub>
      </Brand>

      <Nav>
        {navItems.map((item) => {
          const isActive =
            item.href === "/instructor"
              ? pathname === "/instructor"
              : pathname.startsWith(item.href);
          return (
            <NavLink key={item.label} href={item.href} $active={isActive}>
              <NavIcon>{item.icon}</NavIcon>
              {item.label}
            </NavLink>
          );
        })}
      </Nav>

      <Footer>
        <Avatar>{initial}</Avatar>
        <UserInfo>
          <UserName>{userName}</UserName>
          <UserRole>{userRole}</UserRole>
        </UserInfo>
      </Footer>
    </Sidebar>
  );
}
