"use client";

import { createContext, useContext } from "react";

import type { UserSettingsValues } from "@/lib/settings/constants";

const SettingsContext = createContext<UserSettingsValues | null>(null);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: UserSettingsValues;
  children: React.ReactNode;
}) {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useUserSettings() {
  const settings = useContext(SettingsContext);
  if (!settings) {
    throw new Error("useUserSettings must be used within SettingsProvider");
  }
  return settings;
}
