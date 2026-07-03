"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

export interface MultiSelectOption {
  value: string;
  label: string;
  hint?: string;
}

const Root = styled.div`
  position: relative;
  width: 100%;
`;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 36px;
  padding: 0 12px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input, 8px);
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 14px;
  color: var(--color-text-primary);
  cursor: pointer;
  outline: none;
  gap: 8px;
  text-align: left;
  transition: border-color 0.15s;

  &:focus-visible {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Summary = styled.span<{ $empty: boolean }>`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $empty }) => ($empty ? "var(--color-text-tertiary)" : "var(--color-text-primary)")};
`;

const Chevron = styled.svg<{ $open: boolean }>`
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: transform 0.15s;
  transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
`;

const Panel = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
  padding: 4px;
  max-height: 260px;
  overflow-y: auto;
`;

const Item = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  text-align: left;
  color: var(--color-text-primary);

  &:hover { background: var(--color-surface-tertiary); }
`;

const Box = styled.span<{ $on: boolean }>`
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid ${({ $on }) => ($on ? "var(--color-primary)" : "var(--color-border)")};
  background: ${({ $on }) => ($on ? "var(--color-primary)" : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 0.12s, border-color 0.12s;
`;

const ItemText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

const ItemLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemHint = styled.span`
  font-size: 11px;
  color: var(--color-text-tertiary);
`;

const Empty = styled.div`
  padding: 10px;
  font-size: 12px;
  color: var(--color-text-tertiary);
`;

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
  /** Resumo custom exibido no trigger; por padrão "N selecionadas". */
  summarize?: (selected: string[], options: MultiSelectOption[]) => string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecionar...",
  disabled = false,
  emptyMessage = "Nenhuma opção disponível.",
  summarize,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle(value: string) {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value],
    );
  }

  const summary = summarize
    ? summarize(selected, options)
    : selected.length === 0
      ? placeholder
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label ?? "1 selecionada"
        : `${selected.length} selecionadas`;

  return (
    <Root ref={rootRef}>
      <Trigger
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Summary $empty={selected.length === 0}>{summary}</Summary>
        <Chevron $open={open} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Chevron>
      </Trigger>

      {open && (
        <Panel role="listbox" aria-multiselectable>
          {options.length === 0 ? (
            <Empty>{emptyMessage}</Empty>
          ) : (
            options.map((opt) => {
              const on = selected.includes(opt.value);
              return (
                <Item
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => toggle(opt.value)}
                >
                  <Box $on={on}>
                    {on && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </Box>
                  <ItemText>
                    <ItemLabel>{opt.label}</ItemLabel>
                    {opt.hint && <ItemHint>{opt.hint}</ItemHint>}
                  </ItemText>
                </Item>
              );
            })
          )}
        </Panel>
      )}
    </Root>
  );
}
