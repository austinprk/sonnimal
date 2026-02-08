export interface SerpApiPlaceResult {
  name: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  category?: string;
}

export async function fetchNaverPlaceViaSerpApi(
  placeId: string
): Promise<SerpApiPlaceResult | null> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return null;

  try {
    // Search using the full Naver Place URL so Naver shows the place card
    const searchUrl = new URL("https://serpapi.com/search.json");
    searchUrl.searchParams.set("engine", "naver");
    searchUrl.searchParams.set(
      "query",
      `m.place.naver.com/restaurant/${placeId}`
    );
    searchUrl.searchParams.set("where", "nexearch");
    searchUrl.searchParams.set("api_key", apiKey);

    const res = await fetch(searchUrl.toString(), {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error("SerpApi HTTP error:", res.status);
      return null;
    }

    const data = await res.json();
    const place = extractPlaceFromResults(data);
    if (place) return place;

    // Fallback: try searching with just the place ID
    const fallbackUrl = new URL("https://serpapi.com/search.json");
    fallbackUrl.searchParams.set("engine", "naver");
    fallbackUrl.searchParams.set("query", `네이버플레이스 ${placeId}`);
    fallbackUrl.searchParams.set("where", "nexearch");
    fallbackUrl.searchParams.set("api_key", apiKey);

    const res2 = await fetch(fallbackUrl.toString(), {
      signal: AbortSignal.timeout(15000),
    });
    if (!res2.ok) return null;

    const data2 = await res2.json();
    return extractPlaceFromResults(data2);
  } catch (e) {
    console.error("SerpApi error:", e);
    return null;
  }
}

function extractPlaceFromResults(
  data: Record<string, unknown>
): SerpApiPlaceResult | null {
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
  const organic = data.organic_results as
    | Record<string, unknown>[]
    | undefined;
  if (organic && organic.length > 0) {
    for (const item of organic) {
      const link = item.link as string | undefined;
      if (link?.includes("place.naver.com") && item.title) {
        return { name: item.title as string };
      }
    }
    // Return first organic result title as last resort
    if (organic[0].title) {
      return { name: organic[0].title as string };
    }
  }

  return null;
}
