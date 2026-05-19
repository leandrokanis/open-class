"use client";

import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Line = styled.div`
  flex: 1;
  height: 1px;
  background-color: #e2e8f0;
`;

const Label = styled.span`
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font-inter), system-ui, sans-serif;
  white-space: nowrap;
`;

export function AuthDivider({ label = "ou entre com e-mail" }: { label?: string }) {
  return (
    <Wrapper>
      <Line />
      <Label>{label}</Label>
      <Line />
    </Wrapper>
  );
}
