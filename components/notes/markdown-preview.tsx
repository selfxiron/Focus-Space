import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

export function MarkdownPreview({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content.trim()) {
    return (
      <p className="text-sm text-muted-foreground">Preview will appear here…</p>
    );
  }

  return (
    <div className={cn("markdown-preview text-sm text-foreground", className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-4 text-xl font-semibold first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-4 text-lg font-semibold first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-3 text-base font-semibold first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-brand-dark underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded-md bg-secondary px-1.5 py-0.5 text-[13px]">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre
              className="mb-3 overflow-x-auto rounded-[12px] bg-secondary/80 p-4 text-[13px]"
            >
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className="mb-3 border-l-2 border-brand-dark/40 pl-4 text-muted-foreground"
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
