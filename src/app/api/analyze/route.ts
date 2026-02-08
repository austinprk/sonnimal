import { NextRequest, NextResponse } from "next/server";
import { extractPlaceId, fetchPlaceInfo, fetchReviews } from "@/lib/naver-api";
import { analyzeReviews } from "@/lib/analyze";
import { fetchNaverPlaceViaSerpApi, lastDebug as serpDebug } from "@/lib/serpapi";
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

    const debug: string[] = [];

    // 1. Check cache
    const cached = await getCachedResult(placeId);
    if (cached) {
      return NextResponse.json(cached);
    }
    debug.push("cache: miss");

    // 2. Try Naver (GraphQL + HTML fallback)
    const [placeInfo, reviewData] = await Promise.all([
      fetchPlaceInfo(placeId),
      fetchReviews(placeId, 1, 50),
    ]);
    debug.push(
      `naver: place=${placeInfo?.name ?? "null"}, reviews=${reviewData?.reviews?.length ?? "null"}`
    );

    // If we have reviews, analyze them
    if (reviewData && reviewData.reviews.length > 0) {
      const result = analyzeReviews(reviewData.reviews, placeInfo, placeId);
      await setCachedResult(placeId, result);
      return NextResponse.json(result);
    }

    // If we have placeInfo but no reviews, return partial result
    if (placeInfo) {
      const result = {
        restaurant: {
          name: placeInfo.name,
          placeId,
          period: "최근 30일",
        },
        stats: {
          totalReviews: placeInfo.visitorReviewCount || 0,
          reviewChange: 0,
          averageRating: placeInfo.visitorReviewScore || 0,
          needResponse: 0,
        },
        categories: [],
        complaints: [],
        praises: [],
        actionItems: [],
        reviews: [],
        isDemo: false,
      };
      await setCachedResult(placeId, result);
      return NextResponse.json(result);
    }

    // 3. Try SerpApi
    debug.push(`serpapi_key: ${process.env.SERPAPI_API_KEY ? "set" : "MISSING"}`);
    const serpResult = await fetchNaverPlaceViaSerpApi(placeId);
    debug.push(`serpapi: ${serpResult ? JSON.stringify(serpResult) : "null"} (${serpDebug})`);

    if (serpResult) {
      const result = {
        restaurant: {
          name: serpResult.name,
          placeId,
          period: "최근 30일",
        },
        stats: {
          totalReviews: serpResult.reviewCount || 0,
          reviewChange: 0,
          averageRating: serpResult.rating || 0,
          needResponse: 0,
        },
        categories: [],
        complaints: [],
        praises: [],
        actionItems: [],
        reviews: [],
        isDemo: false,
      };
      await setCachedResult(placeId, result);
      return NextResponse.json(result);
    }

    // 4. All failed
    console.error("All sources failed:", debug);
    return NextResponse.json(
      { error: `리뷰 데이터를 가져올 수 없습니다. [${debug.join(" | ")}]` },
      { status: 502 }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: `분석 중 오류: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
