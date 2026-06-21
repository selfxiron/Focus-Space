"use client";

import { useEffect, useState } from "react";

import { SettingsProvider } from "@/components/settings/settings-provider";
import { getUserSettingsAction } from "@/lib/actions/user-settings";
import { DEFAULT_USER_SETTINGS } from "@/lib/settings/constants";

export function SettingsHydrator({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_USER_SETTINGS);

  useEffect(() => {
    void getUserSettingsAction()
      .then(setSettings)
      .catch(() => {
        // Keep defaults if settings table is unavailable
      });
  }, []);

  return <SettingsProvider settings={settings}>{children}</SettingsProvider>;
}
