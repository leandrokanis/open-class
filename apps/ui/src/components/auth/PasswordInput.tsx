"use client";

import styled from "styled-components";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;

  &:hover {
    color: var(--color-text-secondary);
  }
`;

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  hasError?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ hasError, style, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <Wrapper>
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          inputSize="md"
          style={{ paddingRight: 44, ...style }}
          aria-invalid={hasError ? "true" : undefined}
          {...props}
        />
        <ToggleButton
          type="button"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
            {visible ? "visibility_off" : "visibility"}
          </span>
        </ToggleButton>
      </Wrapper>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
