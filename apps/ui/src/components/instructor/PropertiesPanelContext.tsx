"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface PropertiesPanelCtx {
  target: HTMLDivElement | null;
  registerTarget: (el: HTMLDivElement | null) => void;
  hasPanel: boolean;
  setHasPanel: (v: boolean) => void;
}

const PropertiesPanelContext = createContext<PropertiesPanelCtx>({
  target: null,
  registerTarget: () => {},
  hasPanel: false,
  setHasPanel: () => {},
});

export function PropertiesPanelProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const [hasPanel, setHasPanel] = useState(false);
  const registerTarget = useCallback((el: HTMLDivElement | null) => setTarget(el), []);
  return (
    <PropertiesPanelContext.Provider value={{ target, registerTarget, hasPanel, setHasPanel }}>
      {children}
    </PropertiesPanelContext.Provider>
  );
}

export function usePropertiesPanel() {
  return useContext(PropertiesPanelContext);
}
