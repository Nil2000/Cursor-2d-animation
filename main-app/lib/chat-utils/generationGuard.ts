export const MAX_CHAT_MESSAGE_LENGTH = 4000;

// ponytail: a crashed generation holds the claim until this expires. Must stay
// longer than the slowest LLM call. Upgrade path is a heartbeat while generating.
export const GENERATION_CLAIM_TIMEOUT_MS = 5 * 60 * 1000;

export function normalizeChatMessage(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX_CHAT_MESSAGE_LENGTH) {
    return null;
  }

  return trimmed;
}

export function shouldAutoGenerate(rows: { type: string }[]): boolean {
  return rows.length === 1 && rows[0]?.type === "user";
}

export function canGenerateFromSaved(
  lastRow: { type: string } | undefined,
): boolean {
  return lastRow?.type === "user";
}
