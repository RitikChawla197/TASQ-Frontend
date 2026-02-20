"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type KanbanFilterContextType = {
  filterUserId: string;
  setFilterUserId: (id: string) => void;
};

const KanbanFilterContext = createContext<KanbanFilterContextType | null>(null);

export function KanbanFilterProvider({ children }: { children: ReactNode }) {
  const [filterUserId, setFilterUserId] = useState<string>("all");

  return (
    <KanbanFilterContext.Provider value={{ filterUserId, setFilterUserId }}>
      {children}
    </KanbanFilterContext.Provider>
  );
}

export function useKanbanFilter() {
  const ctx = useContext(KanbanFilterContext);
  if (!ctx) {
    throw new Error(
      "useKanbanFilter must be used inside KanbanFilterProvider"
    );
  }
  return ctx;
}
