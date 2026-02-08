import { NextRequest, NextResponse } from "next/server";
import { extractPlaceId, fetchPlaceInfo, fetchReviews } from "@/lib/naver-api";
import { analyzeReviews, generateFallbackData } from "@/lib/analyze";

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

    // Try fetching real data from Naver
    const [placeInfo, reviewData] = await Promise.all([
      fetchPlaceInfo(placeId),
      fetchReviews(placeId, 1, 50),
    ]);

    if (reviewData && reviewData.reviews.length > 0) {
      // Real data available
      const result = analyzeReviews(reviewData.reviews, placeInfo, placeId);
      return NextResponse.json(result);
    }

    // Fallback: generate deterministic data based on place ID
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
