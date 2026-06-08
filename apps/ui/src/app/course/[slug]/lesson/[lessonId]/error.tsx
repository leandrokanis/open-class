"use client";

import styled from "styled-components";

const Wrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  color: var(--color-text-primary);
`;

const Message = styled.p`
  font-size: 15px;
  color: var(--color-text-secondary);
  text-align: center;
`;

const RetryBtn = styled.button`
  padding: 10px 24px;
  border-radius: var(--radius-btn);
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
`;

export default function LessonError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Wrap>
      <Message>Não foi possível carregar a aula. Tente novamente.</Message>
      <RetryBtn onClick={reset}>Tentar novamente</RetryBtn>
    </Wrap>
  );
}
