export class SchemaNotReadyError extends Error {
  constructor(message = "Database tables are not set up yet.") {
    super(message);
    this.name = "SchemaNotReadyError";
  }
}

export function isMissingTableError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);

  return (
    message.includes("Could not find the table") ||
    message.includes("schema cache") ||
    message.includes("relation") && message.includes("does not exist")
  );
}

export function toDbError(error: { message: string }): Error {
  if (isMissingTableError(error)) {
    return new SchemaNotReadyError(error.message);
  }
  return new Error(error.message);
}
