"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface SidebarSlotCtx {
  target: HTMLDivElement | null;
  registerTarget: (el: HTMLDivElement | null) => void;
  hasPanel: boolean;
  setHasPanel: (v: boolean) => void;
}

const SidebarSlotContext = createContext<SidebarSlotCtx>({
  target: null,
  registerTarget: () => {},
  hasPanel: false,
  setHasPanel: () => {},
});

export function SidebarSlotProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const [hasPanel, setHasPanel] = useState(false);
  const registerTarget = useCallback((el: HTMLDivElement | null) => setTarget(el), []);
  return (
    <SidebarSlotContext.Provider value={{ target, registerTarget, hasPanel, setHasPanel }}>
      {children}
    </SidebarSlotContext.Provider>
  );
}

export function useSidebarSlot() {
  return useContext(SidebarSlotContext);
}
