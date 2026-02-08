const GRAPHQL_ENDPOINT = "https://pcmap-api.place.naver.com/place/graphql";

const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  Origin: "https://pcmap.place.naver.com",
  Referer: "https://pcmap.place.naver.com/",
};

export interface NaverReview {
  id: string;
  rating: number;
  authorNickname: string;
  body: string;
  created: string;
  visitCount: number;
}

export interface NaverPlaceInfo {
  name: string;
  category: string;
  visitorReviewCount: number;
  visitorReviewScore: number;
}

export function extractPlaceId(url: string): string | null {
  // Handle various URL formats:
  // https://m.place.naver.com/restaurant/1243837618/home
  // https://pcmap.place.naver.com/restaurant/1243837618
  // https://naver.me/xxxxx (short URL)
  // https://map.naver.com/v5/search/.../place/1243837618
  const patterns = [
    /place\.naver\.com\/\w+\/(\d+)/,
    /map\.naver\.com\/.*place\/(\d+)/,
    /naver\.com\/.*\/(\d{7,})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function fetchPlaceInfo(
  placeId: string
): Promise<NaverPlaceInfo | null> {
  // Try GraphQL API first
  try {
    const query = [
      {
        operationName: "getPlaceInfo",
        variables: { id: placeId },
        query: `query getPlaceInfo($id: String!) {
          place(id: $id) {
            name
            category
            visitorReviewCount
            visitorReviewScore
          }
        }`,
      },
    ];

    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(query),
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      const place = data?.[0]?.data?.place;
      if (place) {
        return {
          name: place.name,
          category: place.category,
          visitorReviewCount: place.visitorReviewCount,
          visitorReviewScore: place.visitorReviewScore,
        };
      }
    }
  } catch {
    // Continue to HTML fallback
  }

  // Fallback: fetch the page HTML and extract name from <title>
  try {
    const pageUrl = `https://m.place.naver.com/restaurant/${placeId}/home`;
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent": HEADERS["User-Agent"],
        Accept: "text/html",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
    });

    if (!res.ok) return null;

    const html = await res.text();

    // Extract name from <title> or og:title
    const ogMatch = html.match(
      /property="og:title"\s+content="([^"]+)"/
    ) || html.match(
      /content="([^"]+)"\s+property="og:title"/
    );
    if (ogMatch) {
      const name = ogMatch[1].replace(/\s*[-|:]\s*네이버.*$/i, "").trim();
      return { name, category: "", visitorReviewCount: 0, visitorReviewScore: 0 };
    }

    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      const name = titleMatch[1].replace(/\s*[-|:]\s*네이버.*$/i, "").trim();
      return { name, category: "", visitorReviewCount: 0, visitorReviewScore: 0 };
    }
  } catch {
    // Both methods failed
  }

  return null;
}

export async function fetchReviews(
  placeId: string,
  page = 1,
  size = 50
): Promise<{ reviews: NaverReview[]; total: number } | null> {
  try {
    const query = [
      {
        operationName: "getVisitorReviews",
        variables: {
          input: {
            businessId: placeId,
            businessType: "restaurant",
            page,
            size,
            isPhotoUsed: false,
            includeContent: true,
            getUserPhotos: false,
            includeReceiptPhotos: false,
          },
        },
        query: `query getVisitorReviews($input: VisitorReviewsInput) {
          visitorReviews(input: $input) {
            items {
              id
              rating
              author {
                nickname
              }
              body
              created
              visitCount
            }
            total
          }
        }`,
      },
    ];

    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(query),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const reviewData = data?.[0]?.data?.visitorReviews;
    if (!reviewData) return null;

    return {
      reviews: reviewData.items.map(
        (item: {
          id: string;
          rating: number;
          author: { nickname: string };
          body: string;
          created: string;
          visitCount: number;
        }) => ({
          id: item.id,
          rating: item.rating,
          authorNickname: item.author?.nickname || "익명",
          body: item.body || "",
          created: item.created,
          visitCount: item.visitCount || 0,
        })
      ),
      total: reviewData.total,
    };
  } catch {
    return null;
  }
}
