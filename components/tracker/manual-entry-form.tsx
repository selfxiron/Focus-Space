"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createManualEntryAction } from "@/lib/actions/time-entries";
import type { SubjectRow } from "@/lib/data/subjects";

interface ManualEntryFormProps {
  subjects: SubjectRow[];
}

export function ManualEntryForm({ subjects }: ManualEntryFormProps) {
  const router = useRouter();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [startTime, setStartTime] = useState(toLocalInput(oneHourAgo));
  const [endTime, setEndTime] = useState(toLocalInput(now));
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createManualEntryAction({
        subjectId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        note,
      });
      setNote("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add entry");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Add manual entry
      </Button>
    );
  }

  return (
    <Card className="border-border/60 shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-base">Manual entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manual-subject">Subject</Label>
            <select
              id="manual-subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="flex h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="manual-start">Start</Label>
              <Input
                id="manual-start"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-end">End</Label>
              <Input
                id="manual-end"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-note">Note (optional)</Label>
            <Textarea
              id="manual-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you work on?"
              rows={2}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !subjectId}>
              Save entry
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
