const GRAPHQL_ENDPOINT = "https://pcmap-api.place.naver.com/place/graphql";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": BROWSER_UA,
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
        "User-Agent": BROWSER_UA,
        Accept: "text/html",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
    });

    if (!res.ok) return null;

    const html = await res.text();

    // Try __NEXT_DATA__ first for rich data
    const nextData = extractNextData(html);
    if (nextData?.placeInfo) {
      return nextData.placeInfo;
    }

    // Extract name from og:title
    const ogMatch =
      html.match(/property="og:title"\s+content="([^"]+)"/) ||
      html.match(/content="([^"]+)"\s+property="og:title"/);
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
  // Try GraphQL API first
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

    if (res.ok) {
      const data = await res.json();
      const reviewData = data?.[0]?.data?.visitorReviews;
      if (reviewData?.items?.length > 0) {
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
      }
    }
  } catch {
    // Continue to HTML fallback
  }

  // Fallback: fetch the review page HTML and extract from __NEXT_DATA__
  try {
    const reviewPageUrl = `https://m.place.naver.com/restaurant/${placeId}/review/visitor`;
    const res = await fetch(reviewPageUrl, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });

    if (!res.ok) return null;

    const html = await res.text();
    const nextData = extractNextData(html);
    if (nextData?.reviews && nextData.reviews.length > 0) {
      return { reviews: nextData.reviews, total: nextData.reviews.length };
    }
  } catch {
    // HTML fallback also failed
  }

  return null;
}

// Extract data from __NEXT_DATA__ embedded in Naver Place HTML
function extractNextData(
  html: string
): { placeInfo?: NaverPlaceInfo; reviews?: NaverReview[] } | null {
  try {
    const match = html.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/
    );
    if (!match) return null;

    const json = JSON.parse(match[1]);
    const result: { placeInfo?: NaverPlaceInfo; reviews?: NaverReview[] } = {};

    // Walk through the JSON to find place info and reviews
    const str = match[1];

    // Try to find place name
    const nameMatch = str.match(/"name"\s*:\s*"([^"]+)"/);
    const categoryMatch = str.match(/"category"\s*:\s*"([^"]+)"/);
    const reviewCountMatch = str.match(/"visitorReviewCount"\s*:\s*(\d+)/);
    const reviewScoreMatch = str.match(/"visitorReviewScore"\s*:\s*([\d.]+)/);

    if (nameMatch) {
      result.placeInfo = {
        name: nameMatch[1],
        category: categoryMatch?.[1] || "",
        visitorReviewCount: reviewCountMatch
          ? parseInt(reviewCountMatch[1])
          : 0,
        visitorReviewScore: reviewScoreMatch
          ? parseFloat(reviewScoreMatch[1])
          : 0,
      };
    }

    // Try to extract reviews - look for visitor review items
    const reviews: NaverReview[] = [];
    // Match review body patterns in the JSON
    const bodyRegex = /"body"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    const ratingRegex = /"rating"\s*:\s*(\d)/g;
    const nicknameRegex = /"nickname"\s*:\s*"([^"]+)"/g;
    const createdRegex = /"created"\s*:\s*"([^"]+)"/g;

    const bodies: string[] = [];
    const ratings: number[] = [];
    const nicknames: string[] = [];
    const dates: string[] = [];

    let m;
    while ((m = bodyRegex.exec(str)) !== null) {
      if (m[1].length > 5) bodies.push(m[1]);
    }
    while ((m = ratingRegex.exec(str)) !== null) ratings.push(parseInt(m[1]));
    while ((m = nicknameRegex.exec(str)) !== null) nicknames.push(m[1]);
    while ((m = createdRegex.exec(str)) !== null) dates.push(m[1]);

    for (let i = 0; i < bodies.length; i++) {
      reviews.push({
        id: String(i),
        rating: ratings[i] || 3,
        authorNickname: nicknames[i] || "익명",
        body: bodies[i].replace(/\\n/g, " ").replace(/\\"/g, '"'),
        created: dates[i] || new Date().toISOString(),
        visitCount: 1,
      });
    }

    if (reviews.length > 0) {
      result.reviews = reviews;
    }

    return result.placeInfo || result.reviews ? result : null;
  } catch {
    return null;
  }
}
