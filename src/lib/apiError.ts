export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ValidationErrorDetail {
  loc?: unknown[];
  msg?: unknown;
}

interface StructuredErrorDetail {
  message?: unknown;
  unsupported_facts?: unknown;
}

export function formatApiErrorDetail(detail: unknown): string | null {
  if (typeof detail === "string" && detail.trim()) return detail;
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const { message, unsupported_facts: unsupportedFacts } = detail as StructuredErrorDetail;
    if (typeof message !== "string" || !message.trim()) return null;
    if (!Array.isArray(unsupportedFacts)) return message;
    const facts = unsupportedFacts.filter(
      (fact): fact is string => typeof fact === "string" && Boolean(fact.trim()),
    );
    return facts.length ? `${message} (${facts.join(", ")})` : message;
  }
  if (!Array.isArray(detail)) return null;

  const messages = detail.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { loc, msg } = item as ValidationErrorDetail;
    if (typeof msg !== "string" || !msg.trim()) return [];
    const field = Array.isArray(loc)
      ? loc.filter((part) => part !== "body").map(String).join(".")
      : "";
    return [field ? `${field}: ${msg}` : msg];
  });
  return messages.length ? messages.join(" · ") : null;
}
