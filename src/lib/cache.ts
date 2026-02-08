import type { AnalysisResult } from "./types";

const KV_PREFIX = "sonnimal:analysis:";
const TTL_SECONDS = 60 * 60 * 24; // 24 hours

let kvAvailable: boolean | null = null;

async function getKV() {
  if (kvAvailable === false) return null;
  try {
    const { kv } = await import("@vercel/kv");
    kvAvailable = true;
    return kv;
  } catch {
    kvAvailable = false;
    return null;
  }
}

export async function getCachedResult(
  placeId: string
): Promise<AnalysisResult | null> {
  const kv = await getKV();
  if (!kv) return null;

  try {
    const cached = await kv.get<AnalysisResult>(KV_PREFIX + placeId);
    return cached;
  } catch {
    return null;
  }
}

export async function setCachedResult(
  placeId: string,
  data: AnalysisResult
): Promise<void> {
  const kv = await getKV();
  if (!kv) return;

  try {
    await kv.set(KV_PREFIX + placeId, data, { ex: TTL_SECONDS });
  } catch {
    // Cache write failure is non-critical
  }
}
