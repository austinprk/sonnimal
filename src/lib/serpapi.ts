export interface SerpApiPlaceResult {
  name: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  category?: string;
  reviews?: { text: string; rating?: number; author?: string; date?: string }[];
}

export async function fetchNaverPlaceViaSerpApi(
  placeId: string
): Promise<SerpApiPlaceResult | null> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return null;

  try {
    // Search Naver for the place ID to get restaurant info
    const searchUrl = new URL("https://serpapi.com/search.json");
    searchUrl.searchParams.set("engine", "naver");
    searchUrl.searchParams.set("query", placeId);
    searchUrl.searchParams.set("where", "nexearch");
    searchUrl.searchParams.set("api_key", apiKey);

    const res = await fetch(searchUrl.toString(), {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const data = await res.json();

    // Extract place info from various result types
    const place = extractPlaceFromResults(data);
    return place;
  } catch {
    return null;
  }
}

function extractPlaceFromResults(data: Record<string, unknown>): SerpApiPlaceResult | null {
  // SerpApi Naver returns different result structures
  // Try to find place/local results

  // Check knowledge_graph
  const kg = data.knowledge_graph as Record<string, unknown> | undefined;
  if (kg?.title) {
    return {
      name: kg.title as string,
      rating: kg.rating as number | undefined,
      reviewCount: kg.review_count as number | undefined,
      address: kg.address as string | undefined,
      category: kg.category as string | undefined,
    };
  }

  // Check places_results
  const places = data.places_results as Record<string, unknown>[] | undefined;
  if (places && places.length > 0) {
    const p = places[0];
    return {
      name: (p.title || p.name) as string,
      rating: p.rating as number | undefined,
      reviewCount: (p.review_count || p.reviews) as number | undefined,
      address: p.address as string | undefined,
      category: p.category as string | undefined,
    };
  }

  // Check local_results
  const locals = data.local_results as Record<string, unknown>[] | undefined;
  if (locals && locals.length > 0) {
    const l = locals[0];
    return {
      name: (l.title || l.name) as string,
      rating: l.rating as number | undefined,
      reviewCount: l.review_count as number | undefined,
      address: l.address as string | undefined,
      category: l.category as string | undefined,
    };
  }

  // Check organic results for place-related content
  const organic = data.organic_results as Record<string, unknown>[] | undefined;
  if (organic && organic.length > 0) {
    const first = organic[0];
    if (first.title && (first.link as string)?.includes("place.naver.com")) {
      return {
        name: first.title as string,
      };
    }
  }

  return null;
}
