import Link from "next/link";
import styled from "styled-components";
import { Icon } from "@/components/ui/Icon";

const BackBtn = styled(Link)`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  @media (min-width: 1024px) {
    display: none;
  }
`;

interface PlayerNavbarMobileProps {
  courseSlug: string;
}

export function PlayerNavbarMobile({ courseSlug }: PlayerNavbarMobileProps) {
  return (
    <BackBtn href={`/curso/${courseSlug}`} aria-label="Voltar para o curso">
      <Icon name="arrow_back" size={20} style={{ color: "#ffffff" }} />
    </BackBtn>
  );
}
