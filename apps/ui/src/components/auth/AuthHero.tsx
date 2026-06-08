"use client";

import styled from "styled-components";
import { usePlatformConfig } from "@/lib/platform-config/usePlatformConfig";

const HeroWrapper = styled.div`
  background: linear-gradient(
    160deg in oklab,
    oklab(26.9% -0.006 -0.102) 0%,
    oklab(37.9% -0.011 -0.137) 50%,
    oklab(54.6% -0.027 -0.214) 100%
  );
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 48px 28px 40px;

  @media (min-width: 768px) {
    padding: 48px 56px;
    justify-content: center;
    flex: 0 0 38%;
    min-height: 100vh;
  }
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 7px;
  flex-shrink: 0;
`;

const LogoText = styled.span`
  color: #ffffff;
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 22px;
`;

const LogoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 5px;
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: 768px) {
    margin-top: 40px;
  }
`;

const Tagline = styled.h1`
  color: #ffffff;
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 110%;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 42px;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 14px;
  line-height: 150%;
  margin: 0;
`;

const GridIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="1" y="1" width="7" height="7" rx="1.5" fill="#FFFFFF" />
    <rect x="12" y="1" width="7" height="7" rx="1.5" fill="#FFFFFF" />
    <rect x="1" y="12" width="7" height="7" rx="1.5" fill="#FFFFFF" />
    <rect x="12" y="12" width="7" height="7" rx="1.5" fill="#FFFFFF" />
  </svg>
);

export function AuthHero() {
  const config = usePlatformConfig();
  return (
    <HeroWrapper>
      <LogoRow>
        <LogoIcon>
          {config.logoUrl ? (
            <LogoImg src={config.logoUrl} alt={config.platformName} />
          ) : (
            <GridIcon />
          )}
        </LogoIcon>
        <LogoText>{config.platformName}</LogoText>
      </LogoRow>
      <TextBlock>
        <Tagline>{config.loginHeroTagline}</Tagline>
        <Subtitle>{config.loginHeroSubtitle}</Subtitle>
      </TextBlock>
    </HeroWrapper>
  );
}
