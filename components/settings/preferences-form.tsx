"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { updateUserSettingsAction } from "@/lib/actions/user-settings";
import {
  TIMEZONE_OPTIONS,
  type UserSettingsValues,
} from "@/lib/settings/constants";

interface PreferencesFormProps {
  initialSettings: UserSettingsValues;
}

export function PreferencesForm({ initialSettings }: PreferencesFormProps) {
  const router = useRouter();
  const [timezone, setTimezone] = useState(initialSettings.timezone);
  const [workMinutes, setWorkMinutes] = useState(
    initialSettings.pomodoroWorkMinutes
  );
  const [breakMinutes, setBreakMinutes] = useState(
    initialSettings.pomodoroBreakMinutes
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await updateUserSettingsAction({
        timezone,
        pomodoroWorkMinutes: workMinutes,
        pomodoroBreakMinutes: breakMinutes,
      });
      setMessage("Preferences saved");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Timezone affects weekly goals, dashboard charts, and streak
          calculations. Pomodoro defaults apply when you open the timer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="settings-timezone">Timezone</Label>
          <select
            id="settings-timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm"
          >
            {TIMEZONE_OPTIONS.map((zone) => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-work">Pomodoro work (min)</Label>
            <input
              id="settings-work"
              type="number"
              min={1}
              max={120}
              value={workMinutes}
              onChange={(e) => setWorkMinutes(Number(e.target.value) || 1)}
              className="flex h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-break">Pomodoro break (min)</Label>
            <input
              id="settings-break"
              type="number"
              min={0}
              max={60}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value) || 0)}
              className="flex h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm"
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}

        <Button onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
