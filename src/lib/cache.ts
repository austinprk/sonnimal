import { Redis } from "@upstash/redis";
import type { AnalysisResult } from "./types";

const PREFIX = "sonnimal:";
const TTL = 60 * 60 * 24; // 24h

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function getCachedResult(
  placeId: string
): Promise<AnalysisResult | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await redis.get<AnalysisResult>(PREFIX + placeId);
  } catch {
    return null;
  }
}

export async function setCachedResult(
  placeId: string,
  data: AnalysisResult
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(PREFIX + placeId, data, { ex: TTL });
  } catch {
    // non-critical
  }
}
