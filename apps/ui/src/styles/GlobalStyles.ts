"use client";

import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    background-color: var(--color-background);
    color: var(--color-text-primary);
    font-family: var(--font-inter), system-ui, sans-serif;
    line-height: 1.5;
    min-height: 100vh;
  }

  img,
  svg {
    display: block;
    max-width: 100%;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  input,
  textarea,
  select {
    font-family: inherit;
  }
`;
