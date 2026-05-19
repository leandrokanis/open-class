"use client";

import styled from "styled-components";

const Hero = styled.section`
  background: var(--gradient-hero);
  padding: 40px 48px;
  color: #ffffff;

  @media (max-width: 767px) {
    padding: 28px 20px;
  }
`;

const WelcomeLabel = styled.p`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-faint-on-dark);
  margin-bottom: 6px;
`;

const HeroLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const Left = styled.div``;

const Name = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.1;
  margin-bottom: 8px;

  @media (max-width: 767px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--color-text-faint-on-dark);
`;

const Stats = styled.div`
  display: flex;
  gap: 0;
  flex-shrink: 0;

  @media (max-width: 767px) {
    width: 100%;
    gap: 8px;
  }
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0 32px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);

  &:first-child {
    border-left: none;
    padding-left: 0;
  }

  @media (max-width: 767px) {
    flex: 1;
    padding: 12px 8px;
    border-left: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StatValue = styled.p`
  font-size: 40px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;

  @media (max-width: 767px) {
    font-size: 28px;
  }
`;

const StatLabel = styled.p`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-faint-on-dark);
  margin-top: 4px;
`;

interface DashboardHeroProps {
  name: string;
  inProgress: number;
  completed: number;
  hoursWatched: number;
}

export function DashboardHero({ name, inProgress, completed, hoursWatched }: DashboardHeroProps) {
  return (
    <Hero>
      <WelcomeLabel>Bem-vinda de volta</WelcomeLabel>
      <HeroLayout>
        <Left>
          <Name>{name}</Name>
          <Subtitle>Continue de onde parou — você está indo muito bem!</Subtitle>
        </Left>
        <Stats>
          <StatItem>
            <StatValue>{inProgress}</StatValue>
            <StatLabel>Em andamento</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{completed}</StatValue>
            <StatLabel>Concluído</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{hoursWatched}h</StatValue>
            <StatLabel>Assistidas</StatLabel>
          </StatItem>
        </Stats>
      </HeroLayout>
    </Hero>
  );
}
