type RateLimitEntry = { count: number; resetAt: number };

const rateLimits = new Map<string, RateLimitEntry>();

export function consumeRequestRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  now = Date.now(),
): boolean {
  for (const [storedKey, entry] of rateLimits) {
    if (entry.resetAt <= now) rateLimits.delete(storedKey);
  }

  const current = rateLimits.get(key);
  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  current.count += 1;
  return current.count <= maxRequests;
}

export async function hashRequestIdentity(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
