'use client';

import { createContext, useContext, useState } from 'react';

export type ActivitySection = 'curriculum' | 'students' | 'revenue' | 'settings';

interface ActivityContextValue {
  activeSection: ActivitySection;
  setActiveSection: (s: ActivitySection) => void;
}

export const ActivityContext = createContext<ActivityContextValue>({
  activeSection: 'curriculum',
  setActiveSection: () => {},
});

export function useActivity() {
  return useContext(ActivityContext);
}

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<ActivitySection>('curriculum');
  return (
    <ActivityContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </ActivityContext.Provider>
  );
}
