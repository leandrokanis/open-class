"use client";

import React, { createContext } from "react";
import type { PlatformConfig } from "@/lib/platform-config";

export const PlatformConfigContext = createContext<PlatformConfig | null>(null);

export function PlatformConfigProvider({
  config,
  children,
}: {
  config: PlatformConfig;
  children: React.ReactNode;
}) {
  return (
    <PlatformConfigContext.Provider value={config}>
      {children}
    </PlatformConfigContext.Provider>
  );
}
