"use client";

import * as RadixSeparator from "@radix-ui/react-separator";
import styled from "styled-components";

const StyledSeparator = styled(RadixSeparator.Root)`
  background-color: var(--color-border);

  &[data-orientation="horizontal"] {
    height: 1px;
    width: 100%;
  }

  &[data-orientation="vertical"] {
    height: 100%;
    width: 1px;
  }
`;

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  className?: string;
}

export function Separator({
  orientation = "horizontal",
  decorative = true,
  className,
}: SeparatorProps) {
  return (
    <StyledSeparator
      orientation={orientation}
      decorative={decorative}
      className={className}
    />
  );
}
