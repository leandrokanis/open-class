"use client";

import styled from "styled-components";

const base = `
  font-family: var(--font-inter), system-ui, sans-serif;
  color: var(--color-text-primary);
`;

export const Display = styled.h1`
  ${base}
  font-size: 44px;
  line-height: 52px;
  font-weight: 900;
  letter-spacing: -0.04em;
`;

export const H1 = styled.h1`
  ${base}
  font-size: 36px;
  line-height: 44px;
  font-weight: 800;
  letter-spacing: -0.03em;
`;

export const H2 = styled.h2`
  ${base}
  font-size: 28px;
  line-height: 36px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

export const H3 = styled.h3`
  ${base}
  font-size: 22px;
  line-height: 28px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

export const BodyLg = styled.p`
  ${base}
  font-size: 16px;
  line-height: 26px;
  font-weight: 400;
`;

export const Body = styled.p`
  ${base}
  font-size: 14px;
  line-height: 18px;
  font-weight: 400;
`;

export const BtnLabel = styled.span`
  ${base}
  font-size: 15px;
  line-height: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

export const CardTitle = styled.span`
  ${base}
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

export const NavLink = styled.span`
  ${base}
  font-size: 14px;
  line-height: 18px;
  font-weight: 500;
  color: var(--color-text-secondary);
`;

export const Overline = styled.span`
  ${base}
  font-size: 13px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
`;

export const Caption = styled.span`
  ${base}
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: var(--color-text-secondary);
`;

export const BadgeDark = styled.span`
  ${base}
  font-size: 12px;
  line-height: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-on-primary);
`;

export const BadgeLight = styled.span`
  ${base}
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  color: var(--color-primary);
`;

export const Chip = styled.span`
  ${base}
  font-size: 10px;
  line-height: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-on-primary);
`;
