import { NextRequest, NextResponse } from "next/server";
import { extractPlaceId, fetchPlaceInfo, fetchReviews } from "@/lib/naver-api";
import { analyzeReviews } from "@/lib/analyze";
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

    // 1. Check cache
    const cached = await getCachedResult(placeId);
    if (cached) {
      return NextResponse.json(cached);
    }

    // 2. Try Naver GraphQL API
    const [placeInfo, reviewData] = await Promise.all([
      fetchPlaceInfo(placeId),
      fetchReviews(placeId, 1, 50),
    ]);

    if (reviewData && reviewData.reviews.length > 0) {
      const result = analyzeReviews(reviewData.reviews, placeInfo, placeId);
      await setCachedResult(placeId, result);
      return NextResponse.json(result);
    }

    // 3. Try SerpApi
    const serpResult = await fetchNaverPlaceViaSerpApi(placeId);
    if (serpResult) {
      // SerpApi gave us place info but no individual reviews
      // Return what we have
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

    // 4. All sources failed
    return NextResponse.json(
      {
        error:
          "리뷰 데이터를 가져올 수 없습니다. SERPAPI_API_KEY가 설정되어 있는지 확인해주세요.",
      },
      { status: 502 }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "분석 중 오류가 발생했습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
