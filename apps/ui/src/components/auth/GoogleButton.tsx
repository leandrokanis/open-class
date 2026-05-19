"use client";

import styled from "styled-components";
import { loginWithGoogle } from "@/lib/auth";

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 13px 16px;
  background-color: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  transition: background-color 0.15s;

  &:hover {
    background-color: #f8fafc;
  }

  &:active {
    background-color: #f1f5f9;
  }
`;

const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.98-4.3 2.98-7.31z"
      fill="#4285F4"
    />
    <path
      d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H1.08v2.57A10 10 0 0 0 10 20z"
      fill="#34A853"
    />
    <path
      d="M4.41 11.92A6.01 6.01 0 0 1 4.1 10c0-.67.12-1.32.31-1.92V5.51H1.08A10 10 0 0 0 0 10c0 1.61.39 3.13 1.08 4.49l3.33-2.57z"
      fill="#FBBC05"
    />
    <path
      d="M10 3.96c1.47 0 2.79.51 3.83 1.5l2.86-2.86C14.96.99 12.7 0 10 0A10 10 0 0 0 1.08 5.51L4.41 8.08C5.2 5.72 7.4 3.96 10 3.96z"
      fill="#EA4335"
    />
  </svg>
);

export function GoogleButton() {
  return (
    <StyledButton type="button" onClick={loginWithGoogle}>
      <GoogleIcon />
      Continuar com Google
    </StyledButton>
  );
}
