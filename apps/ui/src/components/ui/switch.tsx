"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import styled from "styled-components";

const Root = styled(SwitchPrimitive.Root)`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 44px;
  height: 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  background: var(--color-border);
  transition: background 0.2s;
  padding: 0;
  flex-shrink: 0;
  outline: none;

  &[data-state="checked"] {
    background: var(--color-primary);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Thumb = styled(SwitchPrimitive.Thumb)`
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transform: translateX(3px);
  transition: transform 0.2s;

  &[data-state="checked"] {
    transform: translateX(22px);
  }
`;

export function Switch(props: React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return (
    <Root {...props}>
      <Thumb />
    </Root>
  );
}
