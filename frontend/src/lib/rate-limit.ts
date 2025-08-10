type RateWindow = {
  count: number;
  resetAt: number;
};

const windows = new Map<string, RateWindow>();

export function allowRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    windows.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt };
  }

  if (existing.count < limit) {
    existing.count += 1;
    windows.set(key, existing);
    return {
      allowed: true,
      remaining: Math.max(0, limit - existing.count),
      resetAt: existing.resetAt,
    };
  }

  return { allowed: false, remaining: 0, resetAt: existing.resetAt };
}
