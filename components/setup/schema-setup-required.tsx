import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SchemaSetupRequired() {
  return (
    <div className="mx-auto max-w-[720px]">
      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle>Database setup required</CardTitle>
          <p className="text-sm text-muted-foreground">
            Supabase is connected, but the app tables have not been created yet.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            Run the migration once in your Supabase project, then refresh this
            page.
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>
              Open{" "}
              <a
                href="https://supabase.com/dashboard"
                className="font-medium text-brand-dark hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Supabase Dashboard
              </a>{" "}
              → your project → <strong>SQL Editor</strong>
            </li>
            <li>
              Paste the contents of{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-foreground">
                supabase/migrations/0000_initial.sql
              </code>
            </li>
            <li>Click <strong>Run</strong></li>
            <li>Restart <code className="rounded bg-secondary px-1">npm run dev</code> and reload</li>
          </ol>
          <p className="text-muted-foreground">
            Alternative (if{" "}
            <code className="rounded bg-secondary px-1">DATABASE_*</code> is
            configured):{" "}
            <code className="rounded bg-secondary px-1">npm run db:setup</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
