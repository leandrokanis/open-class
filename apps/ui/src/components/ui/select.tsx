"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import styled from "styled-components";

const Trigger = styled(SelectPrimitive.Trigger)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 36px;
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
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }

  &[data-placeholder] span {
    color: var(--color-text-tertiary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Icon = styled(SelectPrimitive.Icon)`
  color: var(--color-text-secondary);
  flex-shrink: 0;
`;

const Content = styled(SelectPrimitive.Content)`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  /* Acima do Dialog (z-index 51): o Select é portalizado no body e, com
     z menor, o dropdown abria atrás do modal. */
  z-index: 60;
  min-width: var(--radix-select-trigger-width);
`;

const Viewport = styled(SelectPrimitive.Viewport)`
  padding: 4px;
`;

const Item = styled(SelectPrimitive.Item)`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--color-text-primary);
  border-radius: 6px;
  cursor: pointer;
  outline: none;
  user-select: none;

  &[data-highlighted] {
    background: var(--color-surface-tertiary);
    color: var(--color-text-primary);
  }

  &[data-state="checked"] {
    font-weight: 600;
  }
`;

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return (
    <Trigger {...props}>
      {children}
      <Icon>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Icon>
    </Trigger>
  );
}

export function SelectContent({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <Content position="popper" sideOffset={4} {...props}>
        <Viewport>{children}</Viewport>
      </Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <Item {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </Item>
  );
}
