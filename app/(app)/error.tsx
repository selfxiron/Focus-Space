"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isUnauthorized = error.message === "Unauthorized";

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h2 className="text-lg font-semibold">
        {isUnauthorized ? "Session expired" : "Something went wrong"}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {isUnauthorized
          ? "Please sign in again to continue."
          : error.message || "An unexpected error occurred."}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        {isUnauthorized ? (
          <Button asChild>
            <a href="/login">Sign in</a>
          </Button>
        ) : (
          <Button onClick={reset}>Try again</Button>
        )}
      </div>
    </div>
  );
}
