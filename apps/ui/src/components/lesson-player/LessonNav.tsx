import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/components/ui/Icon";

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  max-width: 45%;
`;

const NavInfo = styled.div<{ $align: "left" | "right" }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: ${({ $align }) => $align};
`;

const NavLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
`;

const NavTitle = styled.span`
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 500;
  line-height: 1.3;
`;

const Spacer = styled.div``;

interface NavLesson {
  title: string;
  href: string;
}

interface LessonNavProps {
  prev: NavLesson | null;
  next: NavLesson | null;
}

export function LessonNav({ prev, next }: LessonNavProps) {
  return (
    <Nav>
      {prev ? (
        <NavItem href={prev.href}>
          <Icon name="arrow_back" size={16} style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
          <NavInfo $align="left">
            <NavLabel>Anterior</NavLabel>
            <NavTitle>{prev.title}</NavTitle>
          </NavInfo>
        </NavItem>
      ) : (
        <Spacer />
      )}
      {next ? (
        <NavItem href={next.href} style={{ justifyContent: "flex-end" }}>
          <NavInfo $align="right">
            <NavLabel>Próxima</NavLabel>
            <NavTitle>{next.title}</NavTitle>
          </NavInfo>
          <Icon name="arrow_forward" size={16} style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
        </NavItem>
      ) : (
        <Spacer />
      )}
    </Nav>
  );
}
