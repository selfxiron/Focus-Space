import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-[720px]">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-[16px] bg-secondary/60 px-6 py-12 text-center text-sm text-muted-foreground">
            Not implemented yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
