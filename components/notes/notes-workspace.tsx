"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, FileText, Plus, Trash2 } from "lucide-react";

import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createNoteAction,
  deleteNoteAction,
  updateNoteAction,
} from "@/lib/actions/notes";
import type { SubjectRow } from "@/lib/data/subjects";
import type { NoteWithSubject } from "@/lib/data/notes";
import { cn } from "@/lib/utils";

type SaveState = "idle" | "saving" | "saved" | "error";

interface NotesWorkspaceProps {
  notes: NoteWithSubject[];
  subjects: SubjectRow[];
}

export function NotesWorkspace({ notes, subjects }: NotesWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localNotes, setLocalNotes] = useState(notes);
  const [selectedId, setSelectedId] = useState<string | null>(
    notes[0]?.id ?? null
  );
  const [title, setTitle] = useState(notes[0]?.title ?? "");
  const [content, setContent] = useState(notes[0]?.content ?? "");
  const [subjectId, setSubjectId] = useState(notes[0]?.subjectId ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [creating, setCreating] = useState(false);
  const skipNextSaveRef = useRef(false);
  const createdFromQueryRef = useRef(false);

  const selectedNote = localNotes.find((n) => n.id === selectedId);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  useEffect(() => {
    if (!selectedNote) {
      setTitle("");
      setContent("");
      setSubjectId("");
      return;
    }
    skipNextSaveRef.current = true;
    setTitle(selectedNote.title);
    setContent(selectedNote.content);
    setSubjectId(selectedNote.subjectId ?? "");
    setSaveState("idle");
    setSaveError(null);
  }, [selectedId, selectedNote]);

  const persist = useCallback(async () => {
    if (!selectedId) return;

    setSaveState("saving");
    setSaveError(null);

    try {
      await updateNoteAction(selectedId, {
        title,
        content,
        subjectId: subjectId || null,
      });
      setSaveState("saved");
      setLocalNotes((prev) =>
        prev.map((n) =>
          n.id === selectedId
            ? {
                ...n,
                title,
                content,
                subjectId: subjectId || null,
                subjectName:
                  subjects.find((s) => s.id === subjectId)?.name ??
                  n.subjectName,
                subjectColor:
                  subjects.find((s) => s.id === subjectId)?.color ??
                  n.subjectColor,
                updatedAt: new Date(),
              }
            : n
        )
      );
      router.refresh();
    } catch (err) {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    }
  }, [selectedId, title, content, subjectId, subjects, router]);

  useEffect(() => {
    if (!selectedId || skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      void persist();
    }, 800);

    return () => clearTimeout(timer);
  }, [title, content, subjectId, selectedId, persist]);

  async function handleCreate() {
    setCreating(true);
    try {
      const data = await createNoteAction();
      skipNextSaveRef.current = true;
      setSelectedId(data.id);
      setTitle(data.title);
      setContent("");
      setSubjectId("");
      setLocalNotes((prev) => [
        {
          id: data.id,
          userId: data.user_id,
          subjectId: data.subject_id,
          title: data.title,
          content: data.content,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          subjectName: null,
          subjectColor: null,
          subjectIcon: null,
        },
        ...prev,
      ]);
      setSaveState("saved");
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to create note");
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    const selectId = searchParams.get("select");
    if (selectId && localNotes.some((n) => n.id === selectId)) {
      setSelectedId(selectId);
    }
  }, [searchParams, localNotes]);

  useEffect(() => {
    if (searchParams.get("new") !== "1" || createdFromQueryRef.current) {
      return;
    }

    createdFromQueryRef.current = true;
    setCreating(true);

    createNoteAction()
      .then((data) => {
        skipNextSaveRef.current = true;
        setSelectedId(data.id);
        setTitle(data.title);
        setContent("");
        setSubjectId("");
        setLocalNotes((prev) => [
          {
            id: data.id,
            userId: data.user_id,
            subjectId: data.subject_id,
            title: data.title,
            content: data.content,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            subjectName: null,
            subjectColor: null,
            subjectIcon: null,
          },
          ...prev,
        ]);
        setSaveState("saved");
        router.refresh();
      })
      .catch((err) => {
        setSaveError(
          err instanceof Error ? err.message : "Failed to create note"
        );
      })
      .finally(() => {
        setCreating(false);
      });
  }, [searchParams, router]);

  async function handleDelete(noteId: string) {
    if (!confirm("Delete this note?")) return;

    try {
      await deleteNoteAction(noteId);
      const remaining = localNotes.filter((n) => n.id !== noteId);
      setLocalNotes(remaining);
      if (selectedId === noteId) {
        setSelectedId(remaining[0]?.id ?? null);
      }
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const filteredNotes =
    subjectFilter === "all"
      ? localNotes
      : localNotes.filter((n) => n.subjectId === subjectFilter);

  return (
    <div className="mx-auto max-w-[1200px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="h-9 rounded-[12px] border border-input bg-card px-3 text-sm"
          >
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">
            {filteredNotes.length} note{filteredNotes.length === 1 ? "" : "s"}
          </span>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => void handleCreate()}
          disabled={creating}
        >
          <Plus className="h-4 w-4" />
          New note
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="border-border/60 shadow-[var(--shadow-card)]">
          <CardContent className="p-2">
            {filteredNotes.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No notes yet. Create one to start writing.
              </p>
            ) : (
              <ul className="space-y-1">
                {filteredNotes.map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(note.id)}
                      className={cn(
                        "w-full rounded-[12px] px-3 py-2.5 text-left transition-colors",
                        selectedId === note.id
                          ? "bg-brand-muted text-brand-dark"
                          : "hover:bg-secondary/60"
                      )}
                    >
                      <p className="truncate text-sm font-medium">
                        {note.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {note.subjectName ?? "No subject"} ·{" "}
                        {note.updatedAt.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {selectedId ? (
          <Card className="border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 space-y-4 min-w-0">
                  <div className="space-y-2">
                    <Label htmlFor="note-title">Title</Label>
                    <Input
                      id="note-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Note title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note-subject">Subject (optional)</Label>
                    <select
                      id="note-subject"
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="flex h-10 w-full rounded-[12px] border border-input bg-card px-3 text-sm"
                    >
                      <option value="">None</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setPreview((p) => !p)}
                  >
                    {preview ? (
                      <>
                        <FileText className="h-4 w-4" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Preview
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => void handleDelete(selectedId)}
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {preview ? (
                <div className="min-h-[320px] rounded-[14px] border border-border/60 bg-secondary/30 p-4">
                  <MarkdownPreview content={content} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="note-content">Markdown</Label>
                  <Textarea
                    id="note-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write in Markdown…"
                    rows={14}
                    className="min-h-[320px] font-mono text-[13px] leading-relaxed"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {saveState === "saving" && "Saving…"}
                  {saveState === "saved" && "Saved"}
                  {saveState === "error" && saveError}
                  {saveState === "idle" && "Auto-save enabled"}
                </span>
                <span>Markdown supported</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardContent className="flex min-h-[400px] items-center justify-center p-8 text-sm text-muted-foreground">
              Select a note or create a new one.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
