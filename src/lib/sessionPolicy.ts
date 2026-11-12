export function isSessionLifetimeExempt(
  _role: "user" | "admin" | null | undefined,
): boolean {
  return false;
}

export function sessionExpiresAt(
  lastActivityAt: number,
  idleDelayMs: number,
  sessionDurationMs: number,
): number {
  return lastActivityAt + idleDelayMs + sessionDurationMs;
}

export function sessionRemainingMs(
  lastActivityAt: number | null | undefined,
  now: number,
  idleDelayMs: number,
  sessionDurationMs: number,
): number {
  if (!lastActivityAt) return 0;
  const inactiveMs = Math.max(0, now - lastActivityAt);
  if (inactiveMs <= idleDelayMs) return sessionDurationMs;
  return Math.max(0, sessionDurationMs - (inactiveMs - idleDelayMs));
}

export function sessionCountdownActive(
  lastActivityAt: number | null | undefined,
  now: number,
  idleDelayMs: number,
): boolean {
  if (!lastActivityAt) return false;
  return now - lastActivityAt >= idleDelayMs;
}
