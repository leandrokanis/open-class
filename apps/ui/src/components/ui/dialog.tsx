"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { type ReactNode } from "react";

const overlayShow = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const Overlay = styled(RadixDialog.Overlay)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  animation: ${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 50;
`;

const Content = styled(RadixDialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  padding: 24px;
  width: 90vw;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  animation: ${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 51;

  &:focus {
    outline: none;
  }
`;

const Title = styled(RadixDialog.Title)`
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 8px;
`;

const Description = styled(RadixDialog.Description)`
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
`;

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title?: string;
  description?: string;
  children?: ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      )}
      <RadixDialog.Portal>
        <Overlay />
        <Content>
          {title && <Title>{title}</Title>}
          {description && <Description>{description}</Description>}
          {children}
        </Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export const DialogClose = RadixDialog.Close;
