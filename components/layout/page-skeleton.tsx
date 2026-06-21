export function PageSkeleton({
  variant = "default",
}: {
  variant?: "default" | "narrow" | "board";
}) {
  if (variant === "narrow") {
    return (
      <div className="mx-auto max-w-[960px] space-y-6 animate-pulse">
        <div className="h-[200px] rounded-[20px] bg-secondary/70" />
        <div className="h-[140px] rounded-[20px] bg-secondary/60" />
        <div className="h-[320px] rounded-[20px] bg-secondary/50" />
      </div>
    );
  }

  if (variant === "board") {
    return (
      <div className="mx-auto max-w-[1200px] animate-pulse space-y-4">
        <div className="h-10 w-48 rounded-lg bg-secondary/70" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[120px] rounded-[20px] bg-secondary/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 animate-pulse">
      <div className="h-10 w-56 rounded-lg bg-secondary/70" />
      <div className="h-[280px] rounded-[20px] bg-secondary/60" />
    </div>
  );
}
