export function hasAdminRole(claims: unknown): claims is Record<string, unknown> & { sub: string } {
  if (typeof claims !== "object" || claims === null || Array.isArray(claims)) return false;
  const record = claims as Record<string, unknown>;
  const metadata = record.app_metadata;
  if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) return false;
  return record.sub !== "" && typeof record.sub === "string" &&
    (metadata as Record<string, unknown>).role === "admin";
}
