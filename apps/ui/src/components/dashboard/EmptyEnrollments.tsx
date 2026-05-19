"use client";

import styled from "styled-components";
import Link from "next/link";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 40px 24px;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  max-width: 400px;
`;

const ExploreBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: var(--radius-btn);
  background: var(--color-primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.88;
  }
`;

export function EmptyEnrollments() {
  return (
    <Wrapper>
      <Title>Você ainda não está matriculado em nenhum curso</Title>
      <Subtitle>
        Explore o catálogo e comece seu primeiro curso gratuitamente.
      </Subtitle>
      <ExploreBtn href="/">Explorar catálogo</ExploreBtn>
    </Wrapper>
  );
}
