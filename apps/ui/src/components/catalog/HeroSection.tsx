import styled from "styled-components";
import type { CatalogStats } from "@/lib/catalog";

const HeroWrapper = styled.section`
  background: var(--gradient-hero);
  padding: 24px 20px 32px;

  @media (min-width: 768px) {
    padding: 80px 48px;
    text-align: center;
  }
`;

const Eyebrow = styled.p`
  display: none;

  @media (min-width: 768px) {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-on-dark);
    margin-bottom: 16px;
  }
`;

const Headline = styled.h1`
  font-size: 28px;
  font-weight: 800;
  line-height: 1.15;
  color: #ffffff;
  margin-bottom: 8px;

  @media (min-width: 768px) {
    font-size: 56px;
    margin-bottom: 16px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--color-text-on-dark);
  margin-bottom: 24px;

  @media (min-width: 768px) {
    font-size: 18px;
    max-width: 560px;
    margin: 0 auto 36px;
  }
`;

const StatsRow = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-top: 32px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 0 24px;

  &:not(:last-child) {
    border-right: 1px solid rgba(255, 255, 255, 0.2);
  }
`;

const StatNumber = styled.span`
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: var(--color-text-on-dark);
`;

const MobileCount = styled.p`
  font-size: 13px;
  color: var(--color-text-faint-on-dark);
  margin-bottom: 20px;

  @media (min-width: 768px) {
    display: none;
  }
`;

interface HeroSectionProps {
  stats: CatalogStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <HeroWrapper>
      <Eyebrow>Plataforma open source de cursos gratuitos</Eyebrow>
      <Headline>
        Aprenda sem limites,
        <br />
        publique sem custos.
      </Headline>
      <Subtitle>
        Cursos estruturados, organizados em módulos, com acompanhamento de progresso. Grátis para sempre.
      </Subtitle>
      <MobileCount>{stats.totalCourses} cursos gratuitos disponíveis</MobileCount>
      <StatsRow>
        <StatItem>
          <StatNumber>{stats.totalCourses}</StatNumber>
          <StatLabel>cursos disponíveis</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{stats.totalInstructors}</StatNumber>
          <StatLabel>instrutores</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>{stats.percentFree}%</StatNumber>
          <StatLabel>gratuito</StatLabel>
        </StatItem>
      </StatsRow>
    </HeroWrapper>
  );
}
