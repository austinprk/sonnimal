import { NextRequest, NextResponse } from "next/server";
import { extractPlaceId, fetchPlaceInfo, fetchReviews } from "@/lib/naver-api";
import { analyzeReviews, generateFallbackData } from "@/lib/analyze";
import { fetchNaverPlaceViaSerpApi } from "@/lib/serpapi";
import { getCachedResult, setCachedResult } from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL을 입력해주세요." },
        { status: 400 }
      );
    }

    const placeId = extractPlaceId(url);
    if (!placeId) {
      return NextResponse.json(
        { error: "올바른 네이버 플레이스 URL이 아닙니다." },
        { status: 400 }
      );
    }

    // 1. Check Vercel KV cache first
    const cached = await getCachedResult(placeId);
    if (cached) {
      return NextResponse.json(cached);
    }

    // 2. Try Naver GraphQL API directly
    const [placeInfo, reviewData] = await Promise.all([
      fetchPlaceInfo(placeId),
      fetchReviews(placeId, 1, 50),
    ]);

    if (reviewData && reviewData.reviews.length > 0) {
      const result = analyzeReviews(reviewData.reviews, placeInfo, placeId);
      await setCachedResult(placeId, result);
      return NextResponse.json(result);
    }

    // 3. Try SerpApi as secondary source
    const serpResult = await fetchNaverPlaceViaSerpApi(placeId);
    if (serpResult) {
      const fallback = generateFallbackData(placeId);
      // Enrich fallback with real data from SerpApi
      fallback.restaurant.name = serpResult.name;
      if (serpResult.rating) fallback.stats.averageRating = serpResult.rating;
      if (serpResult.reviewCount)
        fallback.stats.totalReviews = serpResult.reviewCount;
      fallback.isDemo = false;
      await setCachedResult(placeId, fallback);
      return NextResponse.json(fallback);
    }

    // 4. Fallback: deterministic demo data
    const fallbackResult = generateFallbackData(placeId);
    return NextResponse.json(fallbackResult);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "분석 중 오류가 발생했습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
