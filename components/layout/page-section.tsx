import { cn } from "@/lib/utils";

export function PageSection({
  title,
  description,
  className,
  children,
  action,
}: {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="fs-section-title">{title}</h2>
          {description && (
            <p className="mt-0.5 fs-section-desc">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
