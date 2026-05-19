"use client";

import styled from "styled-components";
import { useRef } from "react";

const Form = styled.form`
  display: flex;
  gap: 0;
  background: var(--color-surface);
  border-radius: var(--radius-input);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid transparent;
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.15);
  }

  @media (min-width: 768px) {
    max-width: 640px;
    margin: 0 auto;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--color-text-primary);
  background: transparent;
  caret-color: var(--color-primary);

  &::placeholder {
    color: var(--color-text-tertiary);
    transition: opacity 0.15s ease;
  }

  &:focus::placeholder {
    opacity: 0;
  }

  @media (min-width: 768px) {
    padding: 14px 20px;
  }
`;

const Button = styled.button`
  padding: 12px 20px;
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: oklch(from var(--color-primary) calc(l - 0.05) c h);
  }

  @media (min-width: 768px) {
    padding: 14px 28px;
  }
`;

interface SearchBarProps {
  onSearch: (q: string) => void;
  defaultValue?: string;
}

export function SearchBar({ onSearch, defaultValue = "" }: SearchBarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(value), 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    const input = (e.currentTarget as HTMLFormElement).querySelector("input");
    if (input) onSearch(input.value);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Buscar por título, tema ou instrutor..."
        defaultValue={defaultValue}
        onChange={handleChange}
      />
      <Button type="submit">Buscar</Button>
    </Form>
  );
}
